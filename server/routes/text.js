const express = require("express");
const router = express.Router();
const logger = require("../logger");
const mongoose = require("mongoose");
const Text = require("../models/Text");
const Token = require("../models/Token");
const Map = require("../models/Map");

router.get("/:textId", async (req, res) => {
  try {
    logger.info("Get single text", { route: `/api/text/${req.params.textId}` });
    const response = await Text.findOne({ _id: req.params.textId })
      .populate("tokens.token")
      .lean();
    res.json(response);
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to get single text", {
      route: `/api/text/${req.params.textId}`,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const response = await Text.find().populate("tokens.token").lean();
    res.json(response);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/filter", async (req, res) => {
  try {
    if (req.body.get_pages) {
      // Returns total pages instead of page of results
      try {
        if (req.body.search_term && req.body.search_term !== "") {
          logger.info(
            "Getting number of pages for paginator (search filtered)",
            { route: "/api/text/filter" }
          );

          // Search is case-insensitive, non-exact matching
          const tokenResponse = await Token.find({
            project_id: req.body.project_id,
            $or: [
              { value: { $regex: req.body.search_term, $options: "i" } },
              { replacement: { $regex: req.body.search_term, $options: "i" } },
            ],
          }).lean();
          const tokenIds = new Set(tokenResponse.map((token) => token._id));
          const textResponse = await Text.find({
            project_id: req.body.project_id,
            "tokens.token": { $in: Array.from(tokenIds) },
          }).lean();
          const textIds = new Set(textResponse.map((text) => text._id));
          const textsCount = await Text.find({
            project_id: req.body.project_id,
            _id: { $in: Array.from(textIds) },
          }).count();
          const pages = Math.ceil(textsCount / req.query.limit);
          res.json({ totalPages: pages });
        } else {
          logger.info("Getting number of pages for paginator", {
            route: "/api/text/filter",
          });

          const textsCount = await Text.find({
            project_id: req.body.project_id,
          }).count();
          const pages = Math.ceil(textsCount / req.query.limit);
          res.json({ totalPages: pages });
        }
      } catch (err) {
        res.json({ message: err });
        logger.error("Failed to get number of pages for paginator", {
          route: `/api/text/filter/pages/${req.params.projectId}`,
        });
      }
    } else if (req.body.search_term && req.body.search_term !== "") {
      // Pagination with search term filtering
      // TODO: Fix aggregation so that Text collection is hit directly rather than Token -> Text
      logger.info("Fetching search filtered results from paginator", {
        route: "/api/text/filter",
      });

      const skip = parseInt((req.query.page - 1) * req.query.limit);
      const limit = parseInt(req.query.limit);

      // Get _id's of texts that have tokens that match search_term
      const tokenResponse = await Token.find({
        project_id: req.body.project_id,
        $or: [
          { value: { $regex: req.body.search_term } },
          { replacement: { $regex: req.body.search_term } },
        ],
      }).lean();
      const tokenIds = new Set(tokenResponse.map((token) => token._id));

      const textResponse = await Text.find({
        project_id: req.body.project_id,
        "tokens.token": { $in: Array.from(tokenIds) },
      }).lean();
      const textIds = new Set(textResponse.map((text) => text._id));

      // Filter results using text Ids for matching.
      // TODO: remove duplication with code in else block...
      const textAggregation = await Text.aggregate([
        {
          $match: {
            project_id: mongoose.Types.ObjectId(req.body.project_id),
            _id: { $in: Array.from(textIds) },
          },
        },
        {
          $project: {
            annotated: "$annotated",
            rank: "$rank",
            token_ids: "$tokens.token",
          },
        },
        {
          $sort: { rank: 1 },
        },
        {
          $skip: skip, // equiv to page
        },
        {
          $limit: limit, // same as limit
        },
      ])
        .allowDiskUse(true)
        .exec();

      // Fetch tokens using ids
      const tokenIdsAgg = textAggregation.map((text) => text.token_ids).flat();
      const tokens = await Token.find({ _id: { $in: tokenIdsAgg } }).lean();

      const payload = {
        textTokenMap: textAggregation,
        tokens: tokens,
      };

      res.json(payload);
    } else {
      // Standard paginator with aggregation
      logger.info("Fetching results from paginator", {
        route: "/api/text/filter",
      });

      const skip = parseInt((req.query.page - 1) * req.query.limit);
      const limit = parseInt(req.query.limit);
      const textAggregation = await Text.aggregate([
        {
          $match: {
            project_id: mongoose.Types.ObjectId(req.body.project_id),
          },
        },
        {
          $project: {
            annotated: "$annotated",
            rank: "$rank",
            token_ids: "$tokens.token",
          },
        },
        {
          $sort: { rank: 1 },
        },
        {
          $skip: skip, // equiv to page
        },
        {
          $limit: limit, // same as limit
        },
      ])
        .allowDiskUse(true)
        .exec();

      // Fetch tokens using ids
      const tokenIds = textAggregation.map((text) => text.token_ids).flat();
      const tokens = await Token.find({ _id: { $in: tokenIds } }).lean();

      const payload = {
        textTokenMap: textAggregation,
        tokens: tokens,
      };

      res.json(payload);
    }
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to get text pagination results", {
      route: `/api/text/filter/${req.body.project_id}`,
    });
  }
});

router.get("/overview/:projectId", async (req, res) => {
  // Get candidate counts across all documents bucketed by their page number
  // This is used for effort estimation for users
  //console.log('Getting candidate overview');
  try {
    const limit = parseInt(req.query.limit);
    //console.log('bucket size', limit);

    // Aggregation
    const textAggregation = await Text.aggregate([
      {
        $match: { project_id: mongoose.Types.ObjectId(req.params.projectId) },
      },
      {
        $lookup: {
          from: "tokens", // need to use MongoDB collection name - NOT mongoose model name
          localField: "tokens.token",
          foreignField: "_id",
          as: "tokens_detail",
        },
      },
      // Merges data in text model and that retrieved from the tokens collection into single object
      {
        $project: {
          candidates: "$candidates",
          tokens: {
            $map: {
              input: { $zip: { inputs: ["$tokens", "$tokens_detail"] } },
              as: "el",
              in: {
                $mergeObjects: [
                  { $arrayElemAt: ["$$el", 0] },
                  { $arrayElemAt: ["$$el", 1] },
                ],
              },
            },
          },
        },
      },
      // To sort data based on the number of replacement candidates e.g. those that are not ds, en, abrv, unsure, etc.
      // First need to addField aggregated over these fields and then sort descending using the calculated field
      {
        $addFields: {
          candidates_bool: "$tokens.english_word",
        },
      },
      {
        $project: {
          candidates: {
            $map: {
              input: "$candidates_bool",
              as: "candidate",
              in: { $cond: { if: "$$candidate", then: 0, else: 1 } }, // 1 if not english word else 0
            },
          },
        },
      },
      {
        $addFields: {
          candidate_count: { $sum: "$candidates" },
        },
      },
      // Sort based on the number of candidates
      {
        $sort: { candidate_count: -1 }, // -1 descending, 1 ascending
      },
      {
        $project: {
          candidate_count: "$candidate_count",
        },
      },
    ])
      .allowDiskUse(true)
      .exec();

    // Chunk results based on limit
    // https://stackoverflow.com/questions/60007739/splitting-array-into-groups-using-typescript-javascript
    var chunks = [],
      i = 0;
    while (i < textAggregation.length)
      chunks.push(textAggregation.slice(i, (i += parseInt(limit))));

    // If more than chunkLimit then return data for line-chart in react-vis otherwise return data for heatmap

    if (chunks.length > 50) {
      // Line data - x: average candidate count for the texts on the given page, y: page number
      // Note: page number is indexed from 1 for readability.
      const data = chunks.map((page, pageNumber) => ({
        x: pageNumber + 1,
        y:
          page.map((text) => text.candidate_count).reduce((a, b) => a + b, 0) /
          page.length,
      }));
      res.json({ type: "line", data: data });
    } else {
      // Heat map data - x: text number, y: page number, color: count of candidates
      // Note: indexes are from 1 not 0 for readability.
      const data = chunks
        .map((page, pageNumber) =>
          page.map((text, textIndex) => ({
            x: textIndex + 1,
            y: pageNumber + 1,
            color: text.candidate_count,
          }))
        )
        .flat();
      res.json({ type: "heatmap", data: data });
    }
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/save/annotations", async (req, res) => {
  logger.info("Saving annotation states on texts", {
    route: "/api/text/save/annotations",
  });
  try {
    const textsRes = await Text.find({ _id: { $in: req.body.textIds } })
      .populate("tokens.token")
      .lean();

    if (req.body.replacements_only) {
      const checkTextState = (text) => {
        // Checks whether the tokens in a text have been annotated
        // if so, the text will be marked as annotated
        const textHasCandidates =
          text.tokens.filter(
            (token) =>
              token.token.meta_tags.length > 1 ||
              token.token.replacement ||
              token.token.suggested_replacement
          ).length > 0;
        return textHasCandidates;
      };

      const annotatedTextIds = textsRes
        .filter((text) => checkTextState(text))
        .map((text) => text._id);

      console.log(annotatedTextIds);

      // Patch annotated field on texts
      const testUpdateRes = await Text.updateMany(
        { _id: { $in: annotatedTextIds } },
        { annotated: true, last_modified: new Date(Date.now()) }
      );

      res.json(testUpdateRes);
    } else {
      // Previously only marked annotated texts as those that had a change made
      const testUpdateRes = await Text.updateMany(
        { _id: { $in: req.body.textIds } },
        { annotated: true, last_modified: new Date(Date.now()) }
      );
      res.json(testUpdateRes);
    }
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to update annotation states of texts", {
      route: "/api/text/annotations/update",
    });
  }
});

router.patch("/save/annotation/:textId", async (req, res) => {
  // Updates the annotation status of a given text
  try {
    await Text.updateOne(
      { _id: req.params.textId },
      { annotated: req.body.value, last_modified: new Date(Date.now()) }
    );

    res.json({ message: "successfully updated annotation state" });
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/tokenize/:textId", async (req, res) => {
  try {
    logger.info("Tokenizing single text", {
      route: `/api/text/tokenize/${req.params.textId}`,
    });

    const text = await Text.findOne({ _id: req.params.textId })
      .populate("tokens.token")
      .lean();
    const textIndexes = text.tokens.map((token) => token.index);

    // Get indexes of all those in token piece groups
    const tokenIndexesTCAll = req.body.index_groups_tc.flat();

    // TC: Indexes To Change
    // Only looks at the first index of each group as this will be where
    // the new token will be inserted
    const tokenIndexesTC = req.body.index_groups_tc.map((group) => group[0]);

    // TK: Indexes To Keep
    const tokenIndexesTK = textIndexes.filter(
      (x) => !tokenIndexesTCAll.includes(x)
    );

    // Convert groups of token indexes into strings
    // There may be n groups of token pieces
    let tokenValuesTC = req.body.index_groups_tc.map((group) =>
      group.map(
        (value) =>
          text.tokens
            .filter((token) => token.index === value)
            .map((token) =>
              token.token.replacement
                ? token.token.replacement
                : token.token.value
            )[0]
      )
    );
    tokenValuesTC = tokenValuesTC.map((valueGroup) => valueGroup.join(""));

    // These are used to update the app store values
    const tokenIdsTC = text.tokens
      .filter((token) => tokenIndexesTCAll.includes(token.index))
      .map((token) => token._id);

    // Create new tokens
    const enMap = await Map.findOne({ type: "en" }).lean();
    const enMapSet = new Set(enMap.tokens);

    // Here all historical info will be stripped from new tokens; however they will
    // be checked if they are in the English lexicon
    const newTokenList = tokenValuesTC.map((token) => {
      return {
        value: token,
        meta_tags: { en: enMapSet.has(token) },
        replacement: null,
        suggested_replacement: null,
        project_id: req.body.project_id,
      };
    });

    // Insert tokens into Token collection
    const tokenListRes = await Token.insertMany(newTokenList);

    // Build token array, assign indices and update text
    // - these are original tokens that remain unchanged, filtered by
    //   their index
    const oTokens = text.tokens
      .map((token) => token.token)
      .filter((e, i) => {
        return tokenIndexesTK.indexOf(i) !== -1;
      });
    const oTokensPayload = {
      tokens: tokenIndexesTK.map((originalIndex, sliceIndex) => ({
        index: originalIndex,
        token: oTokens[sliceIndex]._id,
      })),
    };

    // Add new tokens
    const nTokensPayload = {
      tokens: tokenIndexesTC.map((originalIndex, sliceIndex) => ({
        index: originalIndex,
        token: tokenListRes[sliceIndex]._id,
      })),
    };

    // Get new token Ids to update app store values
    const newTokenIds = nTokensPayload.tokens.map((token) => token.token);

    // Combine both payloads into single array
    let tokensPayload = {
      tokens: [...oTokensPayload["tokens"], ...nTokensPayload["tokens"]],
    };

    // Sort combined payload by original index
    tokensPayload["tokens"] = tokensPayload["tokens"].sort(
      (a, b) => a.index - b.index
    );

    // update indexes based on current ordering
    tokensPayload["tokens"] = tokensPayload.tokens.map((token, newIndex) => ({
      ...token,
      index: newIndex,
    }));

    // Capture tokenization group mapping
    // {original_index : token_group} where token_group is the original token values
    const tokenizationMap = req.body.index_groups_tc.map((group) => ({
      [group[0]]: group.map(
        (token_index) =>
          text.tokens
            .filter((token) => token.index === token_index)
            .map((token) => ({ index: token.index, info: token.token }))[0]
      ),
    }));

    // Update text tokens array with new tokens
    await Text.findByIdAndUpdate({ _id: req.params.textId }, tokensPayload, {
      new: true,
    });

    // Update text tokenization history
    const updatedTextRes = await Text.findByIdAndUpdate(
      { _id: req.params.textId },
      { $push: { tokenization_hist: tokenizationMap } },
      { upsert: true, new: true }
    )
      .populate("tokens.token")
      .lean();

    // Convert output for app store
    const outputTokens = updatedTextRes.tokens.map((token) => ({
      ...token.token,
      index: token.index,
      token: token.token._id,
    }));

    const outputText = {
      ...updatedTextRes,
      tokens: outputTokens,
      old_token_ids: tokenIdsTC,
      new_token_ids: newTokenIds,
    };

    res.json(outputText);

    // Deactivate unused tokens
    const tokenIdsToDeactive = text.tokens
      .map((token) => token)
      .filter((token) => req.body.index_groups_tc.flat().includes(token.index))
      .map((token) => token.token._id);
    await Token.updateMany(
      { _id: { $in: tokenIdsToDeactive } },
      { active: false }
    );
  } catch (err) {
    res.json({ message: err });
  }
});

// [REVIEW] Undo text tokenization - single text
// WIP - requires using the tokenization history to walk back...
// currently legacy code.
router.patch("/tokenize/undo", async (req, res) => {
  try {
    const textId = await Text.findById({ _id: req.body.text_id }).lean();

    // Remove old tokens
    const oldTokenIds = textId.tokens.map((token) => token._id);
    await Token.deleteMany({ _id: { $in: oldTokenIds } });

    // Create new tokens
    const enMap = await Map.findOne({ type: "en" }).lean();
    const enMapSet = new Set(enMap.tokens);

    // Here all historical info will be stripped from new tokens regardless of whether new combinations are in IV form
    const newTokenList = textId.original.split(" ").map((token) => {
      return {
        value: token,
        meta_tags: { en: enMapSet.has(token) },
        replacement: null,
        suggested_replacement: null,
        project_id: textId.project_id,
      };
    });

    // Insert tokens into Token collection
    const tokenListRes = await Token.insertMany(newTokenList);

    const tokensPayload = {
      tokens: tokenListRes.map((token, index) => ({
        index: index,
        token: token._id,
      })),
    };

    const updatedTextRes = await Text.findByIdAndUpdate(
      { _id: req.body.text_id },
      tokensPayload,
      { new: true }
    )
      .populate("tokens.token")
      .lean();

    // convert text into same format as the paginator (this is expected by front-end components)
    const outputTokens = updatedTextRes.tokens.map((token) => ({
      ...token.token,
      index: token.index,
      token: token.token._id,
    }));
    const outputText = { ...updatedTextRes, tokens: outputTokens };

    res.json(outputText);
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/tokenize/all", async (req, res) => {
  // For trivial cases like ['hell', 'o', 'world'] this is easy.
  // However, for hard cases like ['hell', 'o', 'w', 'o', 'rld'] this becomes hard
  // especially when scanning other documents with different token orders and sizes...
  try {
    res.json("success!");
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
