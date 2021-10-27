const express = require("express");
const router = express.Router();
const logger = require("../logger");
const dotenv = require("dotenv");
const utils = require("./utils");
const jwt = require("jsonwebtoken");
const Project = require("../models/Project");
const Map = require("../models/Map");
const Text = require("../models/Text");
const Token = require("../models/Token");

// Get config variables
dotenv.config();

// Fetch all projects
router.get("/", utils.authenicateToken, async (req, res) => {
  try {
    logger.info("Fetching all projects", { route: "/api/project/" });
    const user_id = utils.tokenGetUserId(req.headers["authorization"]);
    const projects = await Project.find({ user: user_id }, { texts: 0 }).lean();

    res.json(projects);
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to fetch all projects", { route: "/api/project/" });
  }
});

// Fetch projects for project feed
router.get("/feed", utils.authenicateToken, async (req, res) => {
  // logger.info("Fetching project feed", { route: "/api/project/feed" });

  try {
    const user_id = utils.tokenGetUserId(req.headers["authorization"]);
    if (user_id) {
      const projects = await Project.find({ user: user_id }).lean();

      const feedInfo = await Promise.all(
        projects.map(async (project) => {
          const allTokens = null;
          const annotatedTexts = await Text.count({
            project_id: project._id,
            annotated: true,
          });
          const tokens = await Token.find({ project_id: project._id }).lean();

          const uniqueTokens = new Set(
            tokens
              .map((token) =>
                token.replacement ? token.replacement : token.value
              )
              .flat()
          ).size;

          const currentOOVTokens = tokens
            .filter(
              (token) =>
                Object.values(token.meta_tags).filter((tagBool) => tagBool)
                  .length === 0 && !token.replacement
            )
            .map((token) => token.value).length;

          return {
            _id: project._id,
            starting_oov_token_count: project.metrics.starting_oov_token_count,
            starting_vocab_size: project.metrics.starting_vocab_size,
            starting_token_count: project.starting_token_count,
            text_count: project.texts.length,
            annotated_texts: annotatedTexts,
            vocab_reduction:
              ((project.metrics.starting_vocab_size - uniqueTokens) /
                project.metrics.starting_vocab_size) *
              100,
            oov_corrections: currentOOVTokens,
          };
        })
      );

      res.json(feedInfo);
    } else {
      res.json({ message: "token invalid" });
      logger.error("Failed to fetch project feed - token invalid", {
        route: "/api/project/feed",
      });
    }
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to fetch project feed", {
      route: "/api/project/feed",
    });
  }
});

// Update single project
router.patch("/", utils.authenicateToken, async (req, res) => {
  try {
    logger.info("Updating single project", { route: "/api/project/" });
    const user_id = utils.tokenGetUserId(req.headers["authorization"]);
    const updatedProject = await Project.updateOne(
      { _id: req.body.project_id, user: user_id },
      { $set: { title: req.body.title } }
    );
    res.json(updatedProject);
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to update single project", { route: "/api/project/" });
  }
});

// Fetch single project
router.get("/:projectId", utils.authenicateToken, async (req, res) => {
  try {
    logger.info("Fetching single project", {
      route: `/api/project/${req.params.projectId}`,
    });
    const user_id = utils.tokenGetUserId(req.headers["authorization"]);
    const response = await Project.findOne(
      {
        _id: req.params.projectId,
        user: user_id,
      },
      { texts: 0 }
    ).lean();
    res.json(response);
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to fetch single project", {
      route: `/api/project/${req.params.projectId}`,
    });
  }
});

// Create project
router.post("/create", utils.authenicateToken, async (req, res) => {
  try {
    logger.info("Creating project", { route: "/api/project/create" });
    const user_id = utils.tokenGetUserId(req.headers["authorization"]);

    // Load static English map (shared for all projects)
    console.log("Loading English map");
    const enMap = await Map.findOne({ type: "en" }).lean();
    console.log("english map", enMap.length);

    // Build maps
    console.log("Building maps");
    console.log(req.body.maps);
    const mapResponse = await Map.insertMany(req.body.maps);

    // console.log(mapResponse)
    // console.log('maps has response')
    const rpMap = mapResponse.filter((map) => map.type === "rp")[0]; // this should always be present in the maps

    // Build texts and tokens including filtering
    console.log("Building texts and tokens");

    // Pre-processing
    let normalisedTexts = req.body.texts;
    // console.log(normalisedTexts)

    // Mandatory processing
    normalisedTexts = normalisedTexts.map((text) => text.replace("\t", " "));
    // console.log('remove tabs', normalisedTexts)

    if (req.body.lower_case) {
      normalisedTexts = normalisedTexts.map((text) => text.toLowerCase());
      // console.log('remove lowercase', normalisedTexts)
    }
    if (req.body.chars_remove) {
      const escapedChars = [
        "[",
        "]",
        "{",
        "}",
        "(",
        ")",
        "*",
        "+",
        "?",
        "|",
        "^",
        "$",
        ".",
        "\\",
      ];
      const regexCharsEscaped = req.body.chars_remove
        .split("")
        .map((char) => (escapedChars.includes(char) ? `\\${char}` : char));
      const regex = new RegExp("[" + regexCharsEscaped + "]", "g");
      normalisedTexts = normalisedTexts.map((text) => text.replace(regex, " "));
    }

    // Remove multiple white space and trim
    normalisedTexts = normalisedTexts.map((text) =>
      text.replace(/\s+/g, " ").trim()
    );
    // console.log('remove multiple white space', normalisedTexts)

    // remove texts that are empty after normalisation
    let filteredTexts = normalisedTexts
      .filter((text) => text.length > 0)
      .map((text) => text);
    if (req.body.remove_duplicates) {
      filteredTexts = [...new Set(filteredTexts)];
    }

    // Tokenize
    const tokenizedTexts = filteredTexts.map((text) => text.split(" "));

    let globalTokenIndex = -1; // this is used to index the tokenlist that is posted to mongo as a flat list when reconstructing texts
    const tokenTextMap = tokenizedTexts.map((text, textIndex) =>
      text.map((token, tokenIndex) => {
        globalTokenIndex += 1;
        return {
          value: token,
          index: tokenIndex,
          textIndex: textIndex,
          globalTokenIndex: globalTokenIndex,
        };
      })
    );

    // Convert maps to Sets
    let mapSets = Object.assign(
      ...mapResponse.map((map) => ({ [map.type]: new Set(map.tokens) }))
    ); // TODO: include construction of rp map instead of doing separately. use ternary.

    // Create object from array of replacement tokens (this is done as Mongo cannot store keys with . or $ tokens)
    const rpObj = rpMap.replacements.reduce(
      (obj, item) => ({ ...obj, [item.original]: item.normed }),
      {}
    );

    mapSets["rp"] = new Set(Object.keys(rpObj)); //new Set(Object.keys(rpMap.replacements[0]));
    mapSets["en"] = new Set(enMap.tokens);
    // console.log('map sets -> ', mapSets);    // too large with enMap

    // regex digit match (TODO: improve to match digits better)
    const re = /^\d+$/g;

    console.log("Building token list");
    const tokenList = tokenizedTexts.flat().map((token, index) => {
      let metaTags = Object.assign(
        ...Object.keys(mapSets)
          .filter((key) => key !== "rp")
          .map((key) => ({ [key]: mapSets[key].has(token) }))
      );
      const hasReplacement = mapSets.rp.has(token);

      // check if token is digit - if so, classify as English
      if (req.body.detect_digits) {
        const isDigit = token.match(re) !== null;
        metaTags = isDigit ? { ...metaTags, en: true } : metaTags;
      }

      if (token === "") {
        console.log(tokenizedTexts.flat().slice(index - 10, index + 10));
      }

      return {
        value: token,
        meta_tags: metaTags,
        replacement: hasReplacement ? rpObj[token] : null, //rpMap.replacements[0][token] : null,
        suggested_replacement: null,
        active: true,
      };
    });

    console.log("token list length", tokenList.length);

    // console.log('tokens without value', tokenList.filter(token => !token.value).length)

    // console.log('token without value', tokenList.filter(token => !token.value));

    const tokenListResponse = await Token.insertMany(tokenList);

    // Build texts
    console.log("Building texts");
    const builtTexts = tokenTextMap.map((text, index) => {
      return {
        // project_id: 'ph', // Cannot insert real project_id here as the project hasn't been created. This is done below as an updateMany. Uses placeholder is null.
        original: filteredTexts[index],
        tokens: text.map((token) => {
          return {
            index: token.index,
            token: tokenListResponse[token.globalTokenIndex]._id,
          };
        }),
      };
    });

    // console.log(builtTexts);

    // Create texts
    console.log("creating many texts");
    const textResponse = await Text.insertMany(builtTexts);

    // Build project
    console.log("Building project");
    const textObjectIds = textResponse.map((text) => text._id);
    const mapObjectIds = mapResponse.map((map) => map._id);
    const tokenCount = new Set(tokenizedTexts.flat().map((token) => token));
    const candidateTokens = tokenListResponse
      .filter(
        (token) =>
          Object.values(token.meta_tags).filter((tagBool) => tagBool).length ===
            0 && !token.replacement
      )
      .map((token) => token.value);

    console.log("Creating project");
    const projectResponse = await Project.create({
      user: user_id,
      name: req.body.name,
      description: req.body.description,
      preprocessing: {
        lower_case: req.body.lower_case,
        remove_duplicates: req.body.remove_duplicates,
        digits_iv: req.body.detect_digits,
        chars_removed: req.body.chars_remove,
      },
      texts: textObjectIds,
      maps: mapObjectIds,
      metrics: {
        starting_vocab_size: tokenCount.size,
        starting_oov_token_count: candidateTokens.length,
      },
    });
    const projectId = projectResponse._id;

    // Update tokens with project_id fields
    const tokensUpdated = await Token.updateMany(
      { _id: { $in: tokenListResponse.map((token) => token._id) } },
      { project_id: projectId },
      { upsert: true }
    );

    // Update texts in texts collection with project_id field
    const textsUpdateResponse = await Text.updateMany(
      { _id: { $in: textObjectIds } },
      { project_id: projectId },
      { upsert: true }
    );

    // IMPLEMENT TF-IDF ALGORITHM
    console.log("Calculating TF-IDF scores");

    // - Update texts in texts collection with their inverse tf-idf weight
    let counts = {};
    let keys = [];
    for (var i = 0; i < tokenizedTexts.length; i++) {
      var text = tokenizedTexts[i];

      for (var j = 0; j < text.length; j++) {
        var token = text[j];
        if (counts[token] === undefined) {
          counts[token] = {
            tf: 1,
            df: [i], // used to capture index of texts term appears in
          };
          keys.push(token);
        } else {
          counts[token].tf = counts[token].tf + 1;
          if (!counts[token].df.includes(i)) {
            counts[token].df.push(i);
          }
        }
      }
    }

    console.log(new Date(Date.now()).toLocaleString(), "built tf-idf matrices");

    // Aggregate doc counts into df e.g. {key: {tf: #, df #}}
    Object.keys(counts).map(
      (key) => (
        (counts[key].tf = counts[key].tf),
        (counts[key].df = counts[key].df.length)
      )
    );
    console.log(new Date(Date.now()).toLocaleString(), "aggregated counts");

    // Compute tf-idf scores for each token; not assignment is used to flatten array of objects.
    // console.log('tokenized texts length', tokenizedTexts.length)
    const tfidfs = Object.assign(
      ...Object.keys(counts).map((key) => ({
        [key]:
          counts[key].tf === 0 || tokenizedTexts.length / counts[key].df === 0
            ? 0
            : counts[key].tf *
              Math.log10(tokenizedTexts.length / counts[key].df),
      }))
    );
    console.log(
      new Date(Date.now()).toLocaleString(),
      "- Calculated tf-idf weights"
    );

    // Compute average document tf-idf
    // - 1. get set of candidate tokens (derived up-stream)
    // - 2. filter texts for only candidate tokens
    // - 3. compute filtered text average tf-idf score/weight

    const candidateTokensUnique = new Set(candidateTokens);

    // 2. cannot use set operations here as there can be duplicates in the tokenized text; note filter at the end is to remove the nulls
    // console.log('text response', textResponse);
    // console.log('text response, token expanded', textResponse[0].tokens)
    // console.log('token response', tokenListResponse);   // token list response

    // Build map of all tokens by their id - {_id : }
    const tokenMap = Object.fromEntries(
      tokenListResponse.map((token) => [[token._id], token])
    );
    // console.log('tokenMap', tokenMap)

    // Expand token information in text objects by linking to token objcets in tokenMap. Currently text only has token: {_id, index, token} where token is the ID of the token. _id here is the id in the array in the text object.
    // const textsWithTokensPopulated = textResponse.map(text => ({_id: text._id, tokenizedText: text.tokens.map(token => tokenListResponse.filter(resToken => resToken._id === token.token).map(token => token.value)).flat()}))
    const textsWithTokensPopulated = textResponse.map((text) => ({
      _id: text._id,
      tokenizedText: text.tokens.map((token) => tokenMap[token.token].value),
    }));
    // console.log('textsWithTokensPopulated -> ', textsWithTokensPopulated)
    console.log(
      new Date(Date.now()).toLocaleString(),
      "texts with candidate tokens ",
      textsWithTokensPopulated.length
    );

    const textTokenWeights = textsWithTokensPopulated.map((text) => ({
      _id: text._id,
      tokenWeights: text.tokenizedText
        .filter((token) => candidateTokensUnique.has(token))
        .map((token) => tfidfs[token]),
    }));
    // If text has no token weights, give its aggregate value an incredibly high number (10000).
    // Note: text weight is a sum rather than average. THis is because we want to identify when multiple, high, tfidf tokens are present rather than averaging them out.
    const textWeights = textTokenWeights.map((text) => ({
      _id: text._id,
      weight:
        text.tokenWeights.length > 0
          ? text.tokenWeights.reduce((a, b) => a + b)
          : -1,
    }));
    console.log(
      "text objects with weights built",
      new Date(Date.now()).toLocaleString()
    );

    // Rank texts by their weight
    const textWeightsSorted = textWeights
      .sort((a, b) => b.weight - a.weight)
      .map((text, index) => ({ ...text, rank: index }));
    // console.log('text objects with weights ranked', textWeightsSorted)

    // Add weight to text
    // - create update objects
    console.log(
      "Updating texts with TF-IDF scores",
      new Date(Date.now()).toLocaleString()
    );
    const bwTextWeightObjs = textWeightsSorted.map((text) => ({
      updateOne: {
        filter: { _id: text._id },
        update: { weight: text.weight, rank: text.rank },
        options: { upsert: true },
      },
    }));

    console.log(
      "bulk write text objects created - writing to database",
      new Date(Date.now()).toLocaleString()
    );
    const bwTextResponse = await Text.bulkWrite(bwTextWeightObjs);

    // Return
    // res.json('Project created successfully.')
    res.json({ "word tfids": tfidfs });
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to create project", { route: "/api/project/create" });
  }
});

// Delete project
router.delete("/:projectId", utils.authenicateToken, async (req, res) => {
  try {
    logger.info("Deleting project", { route: "/api/project/" });
    const user_id = utils.tokenGetUserId(req.headers["authorization"]);

    const projectResponse = await Project.findOne({
      _id: req.params.projectId,
      user: user_id,
    })
      .populate("texts")
      .lean();

    // Get ids of associated documents
    const textIds = projectResponse.texts.map((text) => text._id);
    const tokenIds = projectResponse.texts
      .map((text) => text.tokens.map((token) => token.token))
      .flat();
    const mapIds = projectResponse.maps;

    // Delete documents in collections
    await Project.deleteOne({ _id: req.params.projectId });
    await Text.deleteMany({ _id: textIds });
    await Token.deleteMany({ _id: tokenIds });
    await Map.deleteMany({ _id: mapIds });
    res.json("Successfully deleted project.");
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to delete project", { route: "/api/project/" });
  }
});

// Get count of tokens and annotated text for a single project
router.get("/counts/:projectId", utils.authenicateToken, async (req, res) => {
  try {
    logger.info("Get project token counts", {
      route: `/api/project/counts/${req.params.projectId}`,
    });
    const textRes = await Text.find({ project_id: req.params.projectId })
      .populate("tokens.token")
      .lean();

    const uniqueTokens = new Set(
      textRes
        .map((text) =>
          text.tokens.map((token) =>
            token.token.replacement
              ? token.token.replacement
              : token.token.value
          )
        )
        .flat()
    );

    // Unlike on project creation, the other meta-tags need to be checked such as removed, noise, etc.
    const allTokens = textRes
      .map((text) => text.tokens.map((token) => token.token))
      .flat();
    const candidateTokens = allTokens
      .filter(
        (token) =>
          Object.values(token.meta_tags).filter((tagBool) => tagBool).length ===
            0 && !token.replacement
      )
      .map((token) => token.value);
    logger.info("vocab counts", {
      vocab_size: uniqueTokens.size,
      candidateTokens: candidateTokens.length,
    });

    // Get annotated text counts
    logger.info("Getting project text annotation progress", {
      route: `/api/project/counts/${req.params.projectId}`,
    });
    const textsAnnotated = textRes.filter((text) => text.annotated).length;
    const textsTotal = textRes.length;
    logger.info("annotation progress", { text_annotated: textsAnnotated });

    res.json({
      token: {
        vocab_size: uniqueTokens.size,
        oov_tokens: candidateTokens.length,
      },
      text: {
        annotated: textsAnnotated,
        total: textsTotal,
      },
    });
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to get project token counts", {
      route: `/api/project/counts/${req.params.projectId}`,
    });
  }
});

// Get metrics that are used in the sidebar for a single project
router.get("/metrics/:projectId", utils.authenicateToken, async (req, res) => {
  try {
    const project = await Project.findById({
      _id: req.params.projectId,
    }).lean();
    const textsTotal = await Text.count({ project_id: req.params.projectId });
    const textsAnnotated = await Text.count({
      project_id: req.params.projectId,
      annotated: true,
    });
    const tokens = await Token.find({
      project_id: req.params.projectId,
    }).lean();

    // Capture the number of tokens that exist in the original values or
    // introduced through replacements (if a token has one)
    const vocabSize = new Set(
      tokens.map((token) =>
        token.replacement ? token.replacement : token.value
      )
    ).size;

    // Capture the number of tokens that are OOV e.g. have no meta-tags that are true
    // including English and do not have a current replacement.
    const oovTokenLength = tokens
      .filter(
        (token) =>
          Object.values(token.meta_tags).filter((tagBool) => tagBool).length ===
            0 && !token.replacement
      )
      .map((token) => token.value).length;

    const payload = [
      {
        description: "Texts Annotated",
        detail: `${textsAnnotated} / ${textsTotal}`,
        value: `${Math.round((textsAnnotated * 100) / textsTotal)}%`,
        title: "Texts that have had classifications or replacements.",
      },
      {
        description: "Vocabulary Reduction",
        detail: `${vocabSize} / ${project.metrics.starting_vocab_size}`,
        value: `${Math.round(
          (1 - vocabSize / project.metrics.starting_vocab_size) * 100
        )}%`,
        title:
          "Comparison between of current vocabulary and starting vocabulary",
      },
      {
        description: "OOV Corrections",
        detail: `${
          project.metrics.starting_oov_token_count - oovTokenLength
        } / ${project.metrics.starting_oov_token_count}`,
        value: `${Math.round(
          ((project.metrics.starting_oov_token_count - oovTokenLength) * 100) /
            project.metrics.starting_oov_token_count
        )}%`,
        title:
          "Sum of all outstanding out-of-vocabulary tokens. All tokens replaced and/or classified with meta-tags are captured",
      },
    ];

    res.json(payload);
  } catch (err) {
    res.json({ message: err });
  }
});

// Download results as seq2seq or tokenclf
// Format results similar to WNUT 2015 (see: http://noisy-text.github.io/2015/norm-shared-task.html), with some modifications
router.post("/download/result", utils.authenicateToken, async (req, res) => {
  try {
    logger.info("Downloading project results", {
      route: "/api/project/download/result",
    });
    let texts = await Text.find({ project_id: req.body.project_id })
      .populate("tokens.token")
      .lean();

    if (req.body.preview) {
      texts = texts.slice(0, 10);
    }

    if (req.body.type === "seq2seq") {
      const results = texts.map((text) => ({
        tid: text._id,
        input: text.original.split(" "),
        // Here tokens marked with 'remove' should be converted to an empty string

        output: text.tokens
          .map((tokenInfo) =>
            tokenInfo.token.replacement
              ? tokenInfo.token.replacement.split(" ")
              : tokenInfo.token.value
          )
          .flat(),
        class: text.tokens
          .map((tokenInfo, index) => {
            if (
              tokenInfo.token.replacement &&
              tokenInfo.token.replacement.split(" ").length > 1
            ) {
              const tokenCount = tokenInfo.token.replacement.split(" ").length;

              return Array(tokenCount).fill(text.tokens[index].token.meta_tags);
            } else {
              return tokenInfo.token.meta_tags;
            }
          })
          .flat(),
      }));

      res.json(results);
    } else if (req.body.type === "tokenclf") {
      // Use tokenization history to format output as n:n
      const results = texts.map((text) => {
        const tokenizationHist = text.tokenization_hist;
        if (tokenizationHist.length > 0) {
          const oTextTokenLen = text.original.split(" ").length;
          const tokenizationHistObj = Object.assign(...tokenizationHist);
          let output = text.tokens.map((tokenInfo, index) => {
            return tokenInfo.token.replacement
              ? tokenInfo.token.replacement
              : tokenInfo.token.value;
          });
          let metaTags = text.tokens.map(
            (tokenInfo) => tokenInfo.token.meta_tags
          );
          // Add white space (and empty metaTags)
          Object.keys(tokenizationHistObj)
            .slice()
            .reverse()
            .map((val) => {
              const numWS = tokenizationHistObj[val].length - 1;
              // add white space
              const indexWS = tokenizationHistObj[val][1].index;
              const ws = Array(numWS).fill(" ");
              // add empty meta tag dicts
              const mtDicts = Array(numWS).fill({});
              if (indexWS > output.length - 1) {
                // minus 1 to account for 0 indexing
                // Extend array (ws at the end)
                output = [...output, ...ws];
                metaTags = [...metaTags, ...mtDicts];
              } else {
                // Otherwise insert
                output.splice(indexWS, 0, ...ws);
                metaTags.splice(indexWS, 0, ...mtDicts);
              }
            });
          return {
            tid: text._id,
            input: text.original.split(" "),
            output: output,
            class: metaTags,
          };
        }

        return {
          tid: text._id,
          input: text.original.split(" "),
          output: text.tokens.map((tokenInfo) =>
            tokenInfo.token.replacement
              ? tokenInfo.token.replacement
              : tokenInfo.token.value
          ),
          class: text.tokens.map((tokenInfo) => tokenInfo.token.meta_tags),
        };
      });
      res.json(results);
    } else {
      // Error invalid type...
      res.sendStatus(500);
    }
    res.json(results);
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to download project results", {
      route: "/api/project/download/result",
    });
  }
});

// Download tokenization history across project
router.post(
  "/download/tokenizations",
  utils.authenicateToken,
  async (req, res) => {
    try {
      const response = await Text.find({ project_id: req.body.project_id })
        .populate("tokens.token")
        .lean();
      // Reduce all of the tokenization histories
      let tHist = response
        .filter((text) => text.tokenization_hist.length > 0)
        .map((text) => {
          const histObj = Object.assign(...text.tokenization_hist);
          const history = Object.keys(histObj).map((key) => ({
            token: histObj[key]
              .map((tokenInfo) => tokenInfo.info.value)
              .join(""),
            pieces: histObj[key].map((tokenInfo) => tokenInfo.info.value),
          }));
          return {
            _id: text._id,
            history: history,
          };
        });

      if (req.body.preview) {
        tHist = tHist.slice(0, 10);
      }

      res.json(tHist);
    } catch (err) {
      res.json({ message: err });
    }
  }
);

module.exports = router;
