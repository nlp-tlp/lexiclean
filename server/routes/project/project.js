const express = require("express");
const router = express.Router();
const logger = require("../../logger");
const utils = require("../auth/utils");
const Project = require("../../models/Project");
const Map = require("../../models/Map");
const Text = require("../../models/Text");
const Token = require("../../models/Token");

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
        description: "Vocabulary Corrections",
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

module.exports = router;
