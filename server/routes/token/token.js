const express = require("express");
const router = express.Router();
const logger = require("../../logger");
const Token = require("../../models/Token");
const Text = require("../../models/Text");

// Add replacement on single token (sets text annotated state to true)
router.patch("/replace/add/single/", async (req, res) => {
  try {
    logger.info("Adding replacement to a single token", {
      route: "/api/token/replace/add/single/",
      body: req.body,
    });
    const updatedReponse = await Token.updateOne(
      { _id: req.body.token_id },
      {
        replacement: req.body.replacement,
        // last_modified: new Date(Date.now()),
      },
      { upsert: true }
    );
    await Text.updateOne(
      { _id: req.body.text_id },
      {
        annotated: true,
        // last_modified: new Date(Date.now())
      },
      { upsert: true }
    );

    res.json(updatedReponse);
  } catch (err) {
    res.json({ message: err });
  }
});

router.delete("/replace/remove/single/:tokenId", async (req, res) => {
  try {
    logger.info("Removing replacement on single token", {
      route: `/api/token/replace/remove/single/${req.params.tokenId}`,
    });
    const response = await Token.updateOne(
      { _id: req.params.tokenId },
      { replacement: null }
    );
    res.json(response);
  } catch (err) {
    res.json({ message: err });
  }
});

// Remove replacements on all tokens with same replacement and original value
// this also includes removing tokens with suggested_replacement too
router.patch("/replace/remove/many/:projectId", async (req, res) => {
  try {
    logger.info("Removing replacements on all tokens", {
      route: `/api/token/replace/remove/many/${req.params.projectId}`,
    });

    // Get all tokens that match the original_tokens value and replacement value
    const tokenResponse = await Token.find({
      $and: [
        { project_id: req.params.projectId },
        { value: req.body.original_token },
        {
          $or: [
            {
              replacement: req.body.replacement,
            },
            {
              suggested_replacement: req.body.replacement,
            },
          ],
        },
      ],
    }).lean();

    const updateTokens = tokenResponse.map((token) => ({
      updateOne: {
        filter: { _id: token._id },
        update: {
          replacement: null,
          suggested_replacement: null, // No point suggesting the removed token
        },
        upsert: true,
      },
    }));
    await Token.bulkWrite(updateTokens);

    res.json({ matches: tokenResponse.length });
  } catch (err) {
    res.json({ message: err });
  }
});

// Convert suggested replacement to replacement on one token (also sets text annotated to true)
router.patch("/suggest/add/single/", async (req, res) => {
  try {
    logger.info("Converting single suggested token into replacement", {
      route: "/api/token/suggest/add/single/",
      body: req.body,
    });
    const updatedReponse = await Token.updateOne(
      { _id: req.body.token_id },
      {
        replacement: req.body.suggested_replacement,
        suggested_replacement: null,
        // last_modified: new Date(Date.now()),
      },
      { upsert: true }
    );
    await Text.updateOne(
      { _id: req.body.text_id },
      {
        annotated: true,
        // last_modified: new Date(Date.now())
      },
      { upsert: true }
    );
    res.json(updatedReponse);
  } catch (err) {
    res.json({ message: err });
  }
});

// Add suggested replacement for all tokens of same value (single OOV->IV map) (does not accept)
router.patch("/suggest/add/many/:projectId", async (req, res) => {
  try {
    logger.info("Adding suggestions to all project tokens", {
      route: `/api/token/suggest/add/many/${req.params.projectId}`,
    });

    const originalToken = req.body.original_token;
    const replacement = req.body.replacement;

    // Get all tokens that match the original_tokens value
    const tokenResponse = await Token.find({
      project_id: req.params.projectId,
      value: originalToken,
    }).lean();

    // Filter out existing replacements
    const candidateTokens = tokenResponse
      .filter((token) => token.replacement === null)
      .map((token) => token);
    // console.log("number of matches", candidateTokens.length);

    const updateTokens = candidateTokens.map((token) => ({
      updateOne: {
        filter: { _id: token._id },
        update: {
          suggested_replacement: replacement,
        },
        upsert: true,
      },
    }));
    await Token.bulkWrite(updateTokens);

    res.json({ matches: candidateTokens.length });
  } catch (err) {
    res.json({ message: err });
  }
});

// Remove suggested replacement on single token
router.delete("/suggest/remove/single/:tokenId", async (req, res) => {
  try {
    logger.info("Removing suggested replacement on single token", {
      route: `/api/token/suggest/remove/single/${req.params.tokenId}`,
    });
    const response = await Token.updateOne(
      { _id: req.params.tokenId },
      { suggested_replacement: null }
    );
    res.json(response);
  } catch (err) {
    res.json({ message: err });
  }
});

// Remove suggested replacements on all tokens
router.patch("/suggest/remove/many/:projectId", async (req, res) => {
  try {
    logger.info("Removing suggested replacement on all tokens", {
      route: `/api/token/suggest/remove/many/${req.params.projectId}`,
    });

    // Get all tokens that match the original_tokens value and suggested_replacement value
    const tokenResponse = await Token.find({
      project_id: req.params.projectId,
      value: req.body.original_token,
      suggested_replacement: req.body.suggested_replacement,
    }).lean();

    const updateTokens = tokenResponse.map((token) => ({
      updateOne: {
        filter: { _id: token._id },
        update: {
          suggested_replacement: null,
        },
        upsert: true,
      },
    }));
    await Token.bulkWrite(updateTokens);

    res.json({ matches: tokenResponse.length });
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/suggest/accept/:projectId", async (req, res) => {
  // Accept suggested replacements as actual replacements for n textsx
  try {
    logger.info("Accepting suggested replacements on n texts", {
      route: `/api/token/suggest/accept/${req.params.projectId}`,
    });
    const textIds = req.body.textIds;
    const textResponse = await Text.find({ _id: { $in: textIds } })
      .populate("tokens.token")
      .lean();

    // console.log(textIds);

    // Filter texts for token that have suggestions
    const candidateTokens = textResponse
      .map((text) =>
        text.tokens
          .filter((tokenInfo) => tokenInfo.token.suggested_replacement)
          .map((tokenInfo) => tokenInfo.token)
      )
      .flat();
    //console.log(candidateTokens);

    // Create objects that convert suggestion to replacement
    const suggestReplaceTokens = candidateTokens.map((token) => ({
      _id: token._id,
      replacement: token.suggested_replacement,
    }));
    //console.log(suggestReplaceTokens);

    // Update tokens
    const suggestedReplaceResponse = await Token.bulkWrite(
      suggestReplaceTokens.map((token) => ({
        updateOne: {
          filter: { _id: token._id },
          update: {
            replacement: token.replacement,
            suggested_replacement: null,
          },
          upsert: true,
        },
      }))
    );

    res.json(suggestedReplaceResponse);
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/suggest/accept/many/:projectId", async (req, res) => {
  // Concerts single suggested replacement type to replacement for all tokens matched
  try {
    logger.info(
      "Accepting single suggested replacement for all matched tokens",
      { route: `/api/token/suggest/accept/many/${req.params.projectId}` }
    );

    let tokenResponse = await Token.find({
      project_id: req.params.projectId,
      value: req.body.original_token,
      suggested_replacement: req.body.suggested_replacement,
    }).lean();

    // console.log(tokenResponse);

    // filter out tokens that have same original value but already have replacements
    tokenResponse = tokenResponse.filter((token) => !token.replacement);
    // Update tokens
    const suggestedReplaceResponse = await Token.bulkWrite(
      tokenResponse.map((token) => ({
        updateOne: {
          filter: { _id: token._id },
          update: {
            replacement: token.suggested_replacement,
            suggested_replacement: null,
          },
          upsert: true,
        },
      }))
    );

    res.json({ matches: tokenResponse.length });
  } catch (err) {
    res.json({ message: err });
  }
});

// --- Meta Tags ---

router.patch("/meta/add/single/", async (req, res) => {
  // Patch meta-tag on one token
  // Takes in field, value pair where the field is the axuiliary information key
  try {
    const tokenResponse = await Token.findById({
      _id: req.body.token_id,
    }).lean();

    const updatedMetaTags = {
      ...tokenResponse.meta_tags,
      [req.body.field]: req.body.value,
    };

    const updatedReponse = await Token.findByIdAndUpdate(
      { _id: req.body.token_id },
      {
        meta_tags: updatedMetaTags,
        // last_modified: new Date(Date.now()),
      },
      { upsert: true }
    ).lean();

    await Text.updateOne(
      { _id: req.body.text_id },
      {
        annotated: true,
        // last_modified: new Date(Date.now())
      },
      { upsert: true }
    );

    res.json(updatedReponse);
  } catch (err) {
    res.json({ message: err });
  }
});

// Patch meta-tags on all tokens
router.patch("/meta/add/many/:projectId", async (req, res) => {
  // Takes in field, value pair where the field is the meta-tag information key
  // Updates all values in data set that match with meta-tag boolean
  try {
    const originalTokenValue = req.body.original_token;
    const metaTag = req.body.field;
    const metaTagValue = req.body.value;

    // Get all tokens that match body token
    const tokenResponse = await Token.find({
      project_id: req.params.projectId,
      value: originalTokenValue,
    }).lean();

    const updateTokens = tokenResponse.map((token) => ({
      updateOne: {
        filter: { _id: token._id },
        update: {
          meta_tags: { ...token.meta_tags, [metaTag]: metaTagValue },
        },
        upsert: true,
      },
    }));

    await Token.bulkWrite(updateTokens);

    // Update text annotation states

    res.json({ matches: tokenResponse.length });
  } catch (err) {
    res.json({ message: err });
  }
});

// Removes meta-tag from one token
router.patch("/meta/remove/one/:tokenId", async (req, res) => {
  //console.log('removing meta-tag from single token')
  try {
    const tokenResponse = await Token.findById({
      _id: req.params.tokenId,
    }).lean();
    const updatedMetaTags = {
      ...tokenResponse.meta_tags,
      [req.body.field]: false,
    };
    const response = await Token.findByIdAndUpdate(
      { _id: req.params.tokenId },
      {
        meta_tags: updatedMetaTags,
        // last_modified: new Date(Date.now()),
      },
      { upsert: true }
    ).lean();
    res.json(response);
  } catch (err) {
    res.json({ message: err });
  }
});

// Removes meta tag from all tokens with similar original value
// TODO: review whether matches should be on the original value and replacement values of
// tokens
router.patch("/meta/remove/many/:projectId", async (req, res) => {
  try {
    const originalTokenValue = req.body.original_token;
    const metaTag = req.body.field;
    const metaTagValue = req.body.value;

    // Get all tokens that match body token
    const tokenResponse = await Token.find({
      project_id: req.params.projectId,
      value: originalTokenValue,
    });

    // console.log(tokenResponse);

    const updateTokens = tokenResponse.map((token) => ({
      updateOne: {
        filter: { _id: token._id },
        update: {
          meta_tags: { ...token.meta_tags, [metaTag]: metaTagValue },
        },
        upsert: true,
      },
    }));

    await Token.bulkWrite(updateTokens);

    res.json({ matches: tokenResponse.length });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
