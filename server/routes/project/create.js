const express = require("express");
const router = express.Router();
const logger = require("../../logger");
const utils = require("../auth/utils");
const Project = require("../../models/Project");
const Map = require("../../models/Map");
const Text = require("../../models/Text");
const Token = require("../../models/Token");
const projectUtils = require("./project-utils");

router.post("/create", utils.authenicateToken, async (req, res) => {
  try {
    logger.info("Creating project", { route: "/api/project/create" });
    const user_id = utils.tokenGetUserId(req.headers["authorization"]);

    /**
     * Load English lexicon (map shared for all projects) and
     * create map sets used for pre-annotation of tokens
     */
    const enMap = await Map.findOne({ type: "en" }).lean();
    const mapResponse = await Map.insertMany(req.body.maps);
    const rpMap = mapResponse.filter((map) => map.type === "rp")[0]; // this should always be present in the maps

    // Convert maps to Sets
    let mapSets = Object.assign(
      ...mapResponse.map((map) => ({ [map.type]: new Set(map.tokens) }))
    ); // TODO: include construction of rp map instead of doing separately. use ternary.

    // Create object from array of replacement tokens
    // (this is done as Mongo cannot store keys with . or $ tokens)
    const rpObj = rpMap.replacements.reduce(
      (obj, item) => ({ ...obj, [item.original]: item.normed }),
      {}
    );
    mapSets["rp"] = new Set(Object.keys(rpObj));
    mapSets["en"] = new Set(enMap.tokens);

    // Process texts they are an Object {id:text}. For users who did not select texts with ids, the id is a placeholder.
    const normalisedTexts = Object.assign(
      {},
      ...Object.keys(req.body.texts).map((textId) => {
        let text = req.body.texts[textId];
        text = projectUtils.removeTabs(text);
        text = projectUtils.removeCasing(req.body.lower_case, text);
        text = projectUtils.removeSpecialChars(req.body.charset_remove, text);
        text = projectUtils.removeWhiteSpace(text);
        return { [textId]: text };
      })
    );
    // Duplication removal
    const filteredTexts = projectUtils.removeDuplicates(
      req.body.remove_duplicates,
      normalisedTexts
    );

    // Create base project
    const project = new Project({
      user: user_id,
      name: req.body.name,
      description: req.body.description,
      preprocessing: {
        lower_case: req.body.lower_case,
        remove_duplicates: req.body.remove_duplicates,
        digits_iv: req.body.detect_digits,
        chars_removed: req.body.chars_remove,
      },
      maps: mapResponse.map((map) => map._id),
    });
    project.save();

    // Create base texts
    const textObjs = filteredTexts.map((obj) => {
      return {
        original: obj.text,
        weight: 0,
        rank: 0,
        annotated: false,
        identifiers: obj.ids,
      };
    });
    let texts = await Text.insertMany(
      textObjs.map((obj) => ({ ...obj, project_id: project._id }))
    );

    // Create tokens
    const createTokens = (text, projectId) => {
      let tokens = text.original.split(" ").map((token, index) => ({
        value: token,
        index: index,
        meta_tags: Object.assign(
          ...Object.keys(mapSets)
            .filter((key) => key !== "rp")
            .map((key) => ({ [key]: mapSets[key].has(token) }))
        ),
        replacement: mapSets.rp.has(token) ? rpObj[token] : null,
        active: true,
        suggested_replacement: null,
        textId: text._id,
        project_id: projectId,
      }));

      if (req.body.detect_digits) {
        tokens = tokens.map((token) => {
          const isDigit = token.value.match(/^\d+$/g) !== null;
          if (isDigit) {
            // check if token is digit - if so, classify as English
            return { ...token, meta_tags: { ...token.meta_tags, en: true } };
          } else {
            return token;
          }
        });
      }
      return tokens;
    };
    const allTokens = texts.flatMap((text) => {
      return createTokens(text, project._id);
    });
    const allTokensRes = await Token.insertMany(allTokens);

    // Add texts and metrics to project
    project.texts = texts.map((text) => text._id);
    project.metrics.starting_vocab_size = new Set(
      texts.flatMap((text) => text.original.split(" "))
    ).size;
    const candidateTokens = allTokensRes
      .filter(
        (token) =>
          Object.values(token.meta_tags).filter((tagBool) => tagBool).length ===
            0 && !token.replacement
      )
      .map((token) => token.value);
    project.metrics.starting_oov_token_count = candidateTokens.length;
    project.save();

    // Update texts with tokens
    const textUpdateObjs = texts.flatMap((text) => ({
      updateOne: {
        filter: { _id: text._id },
        update: {
          tokens: allTokensRes
            .filter((token) => token.textId === text._id)
            .map((token) => ({ index: token.index, token: token._id })),
        },
        options: { new: true },
      },
    }));
    await Text.bulkWrite(textUpdateObjs);

    /**
     * Calculate mean, masked, TF-IDF for each text
     */
    // Compute average document tf-idf
    // - 1. get set of candidate tokens (derived up-stream)
    // - 2. filter texts for only candidate tokens
    // - 3. compute filtered text average tf-idf score/weight
    const tfidfs = projectUtils.calculateTFIDF(texts); // Token tf-idfs

    const candidateTokensUnique = new Set(candidateTokens);
    console.log("candidateTokensUnique", candidateTokensUnique);

    // Fetch texts and populate tokens (they aren't returned from the bulkInsert); TODO: Find better method.
    texts = await Text.find({ project_id: project._id })
      .populate({
        path: "tokens.token",
        select: { _id: 1, value: 1 },
      })
      .lean();

    //  Calculate mean, weighted, tf-idfs scores (TODO: Review values)
    texts = texts.map((text) => {
      const tokenWeights = text.original
        .split(" ")
        .filter((token) => candidateTokensUnique.has(token))
        .map((token) => tfidfs[token]);

      const textWeight =
        tokenWeights.length > 0 ? tokenWeights.reduce((a, b) => a + b) : -1;

      return {
        ...text,
        weight: textWeight,
      };
    });

    // Rank texts by their weight
    texts = texts
      .sort((a, b) => b.weight - a.weight)
      .map((text, index) => ({ ...text, rank: index }));

    // Add weight and rank to text objects
    const weightedTextUpdateObjs = texts.map((text) => ({
      updateOne: {
        filter: { _id: text._id },
        update: { weight: text.weight, rank: text.rank },
        options: { upsert: true },
      },
    }));
    await Text.bulkWrite(weightedTextUpdateObjs);
    res.json({ message: "Project created successfully." });
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to create project", { route: "/api/project/create" });
  }
});

module.exports = router;
