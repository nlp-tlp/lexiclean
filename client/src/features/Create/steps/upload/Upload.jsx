import { useEffect, useState } from "react";
import {
  Grid,
  Stack,
  Typography,
  Button,
  Box,
  Alert,
  Tooltip,
  Modal,
  TextField,
  IconButton,
  AlertTitle,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import UploadIcon from "@mui/icons-material/Upload";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import { StyledChip } from "../../../Dashboard/Details";
import { getCorpusLength } from "../../../../shared/utils/create";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 600,
  overflowY: "auto",
  backgroundColor: "background.light",
  border: "2px solid",
  borderColor: "background.accent",
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
};

const Upload = (props) => {
  const { values, updateValue } = props;
  const corpus = values["corpus"];
  const corpusType = values["corpusType"];

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const resetAlert = () => {
    setShowAlert(false);
    setAlertMessage("");
  };

  const resetCorpus = () => {
    updateValue("corpus", []);
    updateValue("corpusFileName", null);
  };

  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const parseCorpus = (corpus) => {
    /**
     * Parses corpus and limits number of examples shown
     */
    const limit = 25;
    if (Array.isArray(corpus)) {
      if (typeof corpus[0] === "object") {
        // Handle array of objects
        return JSON.stringify(corpus.slice(0, limit), null, 2);
      } else if (typeof corpus[0] === "string") {
        // Handle array of strings
        return corpus.slice(0, limit).join("\n");
      }
    } else {
      corpus = Object.fromEntries(Object.entries(corpus).slice(0, limit));
      return JSON.stringify(corpus, null, 2);
    }
  };

  useEffect(() => {
    if (corpus && corpus === "") {
      // Reset corpus and remove file meta data if user erases all contents of corpus paste bin
      resetCorpus();
    }
  }, [corpus]);

  const readFile = (corpusType, fileMeta) => {
    let reader = new FileReader();
    reader.readAsText(fileMeta);
    reader.onload = () => {
      const fileExt = fileMeta.name.split(".").slice(-1)[0];
      const fileName = fileMeta.name;

      resetAlert();
      resetCorpus();

      let corpus;

      if (fileExt === "txt" && corpusType === "standard") {
        corpus = reader.result
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => line.replace("\r", ""));

        updateValue(
          "corpus",
          Object.assign({}, ...corpus.map((text, index) => ({ [index]: text })))
        );
        updateValue("corpusFileName", fileName);
        updateValue("corpusType", corpusType);
      }
      if (fileExt === "csv" && corpusType === "identifiers") {
        // Uploading data with identifiers

        const rowsObject = reader.result
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => ({
            [line.split(",")[0].trim()]: line
              .split(",")
              .slice(1)
              .join(",")
              .trim(),
          }));

        // Combine row objects into { id: document } objects
        const csvData = Object.assign({}, ...rowsObject);

        updateValue("corpus", csvData);
        updateValue("corpusFileName", fileName);
        updateValue("corpusType", corpusType);
      }

      if (fileExt === "csv" && corpusType === "parallel") {
        // Processing parallel corpus
        try {
          const rowsObject = reader.result
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line, index) => {
              const columns = line.split(",");
              if (columns.length !== 3) {
                throw new Error("Each row must have exactly three columns");
              }
              return {
                id: columns[0],
                source: columns[1].trim(),
                target: columns[2].trim(),
              };
            });

          updateValue("corpus", rowsObject);
          updateValue("corpusFileName", fileName);
          updateValue("corpusType", corpusType);
        } catch (error) {
          console.error("Error processing CSV: ", error.message);
          // Handle error (e.g., show error message to user)
        }
      }
    };
    reader.onloadend = () => {
      reader = new FileReader();
    };
  };

  return (
    <Grid item xs={12} container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info">
          <AlertTitle>Tip!</AlertTitle>
          Upload your text dataset (corpus) here to normalise and, optionally,
          tag entities. For details on supported corpus formats, click the help
          icon. Note: The editor becomes read-only after you upload a file.
        </Alert>
        {showAlert && <Alert severity="error">{alertMessage}</Alert>}
      </Grid>
      <Grid
        item
        xs={12}
        container
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <StyledChip
            label={getCorpusLength(corpus)}
            icon={<ArticleIcon color="inherit" />}
            title="Number of texts in corpus"
            style={{ cursor: "help" }}
          />
          <StyledChip
            label={values["corpusFileName"]}
            icon={<FilePresentIcon color="inherit" />}
            title="Name of uploaded file"
            style={{ cursor: "help" }}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Upload a newline separated text corpus. Click the help icon for more information.">
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
            >
              Upload Standard Corpus
              <input
                id="standard-corpus-file"
                type="file"
                hidden
                onChange={(e) => readFile("standard", e.target.files[0])}
                accept=".txt"
              />
            </Button>
          </Tooltip>
          <Tooltip title="Upload a corpus with identifiers in CSV format. Click the help icon for more information.">
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
            >
              Upload with identifiers
              <input
                id="identifier-corpus-file"
                type="file"
                hidden
                onChange={(e) => readFile("identifiers", e.target.files[0])}
                accept=".csv"
              />
            </Button>
          </Tooltip>
          <Tooltip title="Upload a parallel corpus. Click the help icon for more information.">
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
            >
              Upload parallel corpus
              <input
                id="json-parallel-corpus-file"
                type="file"
                hidden
                onChange={(e) => readFile("parallel", e.target.files[0])}
                accept=".csv"
              />
            </Button>
          </Tooltip>
          <IconButton onClick={handleOpen}>
            <HelpCenterIcon />
          </IconButton>
          <Modal
            open={showModal}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
          >
            <Box sx={style}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography id="modal-modal-title" variant="h6">
                    Supported Corpus Formats
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box>
                    <Alert severity="info">
                      <AlertTitle>Important</AlertTitle>
                      <Typography variant="caption">
                        If custom tokenization is required, it must be performed
                        prior to upload as LexiClean tokenizes on whitespace.
                        For parallel corpora, duplicate identifiers are not
                        permitted and will not be preserved, only the first will
                        be kept.
                      </Typography>
                    </Alert>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      color="text.secondary"
                      fontSize={18}
                      gutterBottom
                    >
                      Standard
                    </Typography>
                    <StyledChip label="Upload Corpus" />
                  </Stack>
                  <Typography gutterBottom variant="body2">
                    Standard corpora in newline separated text format.
                  </Typography>
                  <Typography
                    component="pre"
                    variant="body2"
                    style={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <code>
                      text1
                      <br />
                      text2
                      <br />
                      text3
                      <br />
                      ...
                    </code>
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography color="text.secondary" fontSize={18} gutterBottom>
                    Identifiers
                  </Typography>
                  <StyledChip label="Upload Corpus with Identifiers" />
                </Stack>
                <Typography gutterBottom variant="body2">
                  Corpus with identifiers in CSV format. Do not include headers.
                </Typography>
                <Typography
                  component="pre"
                  variant="body2"
                  style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
                >
                  <code>
                    id1,text1
                    <br />
                    id2,text2
                    <br />
                    id3,text3
                    <br />
                    ...
                  </code>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography color="text.secondary" fontSize={18} gutterBottom>
                    Parallel
                  </Typography>
                  <StyledChip label="Upload Parallel Corpus" />
                </Stack>
                <Typography gutterBottom variant="body2">
                  Corpus with parallel texts and identifiers in CSV format. Do
                  not include headers.
                </Typography>
                <Typography
                  component="pre"
                  variant="body2"
                  style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
                >
                  <code>
                    id1,text1a,text1b
                    <br />
                    id2,text2a,text2b
                    <br />
                    ...
                  </code>
                </Typography>
              </Grid>
            </Box>
          </Modal>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          id="outlined-multiline-flexible"
          label={
            "Upload corpus..."
            // corpusType === "annotation"
            //   ? "Corpus (read only)"
            //   : "Corpus (editable)"
          }
          placeholder="Upload corpus"
          multiline
          rows={20}
          onChange={(e) => updateValue("corpus", e.target.value.split("\n"))}
          value={parseCorpus(corpus)}
          fullWidth
          InputProps={{
            readOnly: true,
          }}
        />
      </Grid>
      {corpusType === "parallel" && (
        <Grid item xs={12}>
          <TextField
            id="special-tokens"
            label={"Special tokens (e.g. <id>, <num>, <date>)"}
            placeholder="Enter comma separated special tokens"
            fullWidth
            onChange={(e) => updateValue("specialTokens", e.target.value)}
            value={values["specialTokens"]}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default Upload;
