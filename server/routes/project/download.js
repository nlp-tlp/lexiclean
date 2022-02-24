const express = require("express");
const router = express.Router();
const logger = require("../../logger");
const utils = require("../auth/utils");
const Text = require("../../models/Text");

router.post("/download/result", utils.authenicateToken, async (req, res) => {
  // Download normalisation results as seq2seq or tokenclf
  try {
    logger.info("Downloading project results", {
      route: "/api/project/download/result",
    });
    let texts;

    if (req.body.preview) {
      if (req.body.annotated) {
        texts = await Text.find({
          project_id: req.body.project_id,
          annotated: req.body.annotated,
        })
          .limit(10)
          .populate("tokens.token")
          .lean();
      } else {
        texts = await Text.find({ project_id: req.body.project_id })
          .limit(10)
          .populate("tokens.token")
          .lean();
      }
    } else {
      if (req.body.annotated) {
        texts = await Text.find({
          project_id: req.body.project_id,
          annotated: req.body.annotated,
        })
          .populate("tokens.token")
          .lean();
      } else {
        texts = await Text.find({ project_id: req.body.project_id })
          .populate("tokens.token")
          .lean();
      }
    }

    let count;

    if (req.body.annotated) {
      count = await Text.count({
        project_id: req.body.project_id,
        annotated: req.body.annotated,
      });
    } else {
      count = await Text.count({ project_id: req.body.project_id });
    }

    if (req.body.type === "seq2seq") {
      const results = texts.map((text) => ({
        tid: text._id,
        identifiers: text.identifiers,
        input: text.original.split(" "),
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

      res.json({ results: results, count: count });
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
            identifiers: text.identifiers,
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
      res.json({ results: results, count: count });
    } else {
      // Error invalid type...
      res.sendStatus(500);
    }
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
