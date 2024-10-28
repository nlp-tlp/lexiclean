import { useEffect, useMemo, useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Stack,
  FormGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  Paper,
  Skeleton,
  Box,
  Autocomplete,
  Alert,
  AlertTitle,
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { StyledChip } from "../../Dashboard/Details";

const PUNCTUATION = "[.,/#!$%^&*;:{}=-_`~()]";

const Preprocessing = ({ values, updateValue }) => {
  const corpus = useMemo(() => Object.values(values["corpus"]), [values]);
  const [originalCorpusDetails, setOriginalCorpusDetails] = useState({});
  const [previewContent, setPreviewContent] = useState(
    "Upload texts to preview"
  );
  const [corpusDetails, setCorpusDetails] = useState({
    corpusSize: 0,
    vocabSize: 0,
    tokenSize: 0,
  });

  useEffect(() => {
    /**
     * Update preview data whenever a text file is uploaded and the pre-processing
     * actions are changed.
     */
    const processCorpus = () => {
      if (
        corpus.length !== 0 &&
        Object.keys(originalCorpusDetails).length === 0
      ) {
        /**
         * 1. Add original corpus details for user
         * 2. Remove multiple white space and trim
         */

        const originalCorpus = corpus.map((text) =>
          text.replace(/\s+/g, " ").trim()
        );
        setOriginalCorpusDetails({
          corpusSize: originalCorpus.length,
          vocabSize: new Set(
            originalCorpus.map((text) => text.split(" ")).flat()
          ).size,
          tokenSize: originalCorpus.map((text) => text.split(" ")).flat()
            .length,
        });
      }

      if (corpus) {
        // Remove multiple white space and trim
        let preCorpus = corpus.map((text) => text.replace(/\s+/g, " ").trim());

        if (values["preprocessRemovePunctuation"]) {
          preCorpus = preCorpus.map((text) =>
            text.replace(
              new RegExp(
                PUNCTUATION.split("")
                  .map((i) => `\\${i}`)
                  .join("|"),
                "g"
              ),
              ""
            )
          );
        }
        if (values["preprocessLowerCase"]) {
          preCorpus = preCorpus.map((text) => text.toLowerCase());
        }
        if (values["preprocessRemoveDuplicates"]) {
          preCorpus = [...new Set(preCorpus)];
        }
        if (values["preprocessRemoveContent"].length > 0) {
          const regex = new RegExp(
            `\\b(${values["preprocessRemoveContent"].join("|")})\\b`,
            "g"
          );
          preCorpus = preCorpus
            .map((text) => text.replace(regex, "").replace(/\s+/g, " ").trim())
            .filter((text) => text !== "");
        }

        // Add data uploaded to preview content
        setPreviewContent(preCorpus.slice(0, 1000).join("\n"));

        setCorpusDetails({
          corpusSize: preCorpus.length,
          vocabSize: new Set(preCorpus.map((text) => text.split(" ")).flat())
            .size,
          tokenSize: preCorpus.map((text) => text.split(" ")).flat().length,
        });
      }
    };

    if (values["corpusType"] !== "parallel") {
      processCorpus();
    }
  }, [corpus, values]);

  const actionAppliedToCorpus =
    values["preprocessRemovePunctuation"] ||
    values["preprocessLowerCase"] ||
    values["preprocessRemoveDuplicates"] ||
    values["preprocessRemoveContent"].length > 0;

  if (values["corpusType"] === "parallel") {
    return (
      <Alert severity="warning">
        <AlertTitle>Warning</AlertTitle>
        Preprocessing is not available for parallel corpora. Please upload a
        standard or identifiers corpus to preprocess.
      </Alert>
    );
  }

  return (
    <Grid container item xs={12}>
      <Grid
        item
        container
        xs={12}
        justifyContent="space-evenly"
        alignItems="center"
        component={Paper}
        variant="outlined"
        mb={2}
      >
        {Object.keys(corpusDetails).map((key) => (
          <Grid item xs={3} p={2} key={`grid-item-${key}`}>
            <Stack direction="column" alignItems="center">
              <MetricWithDiff
                actionAppliedToCorpus={actionAppliedToCorpus}
                originalCorpusDetails={originalCorpusDetails}
                corpusDetails={corpusDetails}
                name={key}
              />
              <Typography
                id="section-subtitle"
                key={`detail-subtitle-${key}`}
                sx={{ textTransform: "capitalize" }}
              >
                {key.replace("Size", "")} Size
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
      <Grid container item xs={12}>
        <Grid
          item
          xs={12}
          component={Paper}
          variant="outlined"
          mb={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 2,
          }}
        >
          <FormControl component="fieldset">
            {/* <FormLabel component="legend">Preprocessing Actions</FormLabel> */}
            <FormGroup style={{ display: "flex", flexDirection: "row" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values["preprocessLowerCase"]}
                    onChange={(e) => {
                      updateValue("preprocessLowerCase", e.target.checked);
                    }}
                    name="remove-casing"
                    title="Removes casing from characters. This can reduce annotation effort."
                  />
                }
                label="Lower Case"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values["preprocessRemovePunctuation"]}
                    onChange={(e) => {
                      updateValue(
                        "preprocessRemovePunctuation",
                        e.target.checked
                      );
                    }}
                    title="Removes punctuation from corpus. This can reduce annotation effort."
                    name="remove-punctuation"
                  />
                }
                label="Remove Punctuation"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values["preprocessRemoveDuplicates"]}
                    onChange={(e) => {
                      updateValue(
                        "preprocessRemoveDuplicates",
                        e.target.checked
                      );
                    }}
                    title="Removes duplicate documents from your corpus. This can reduce annotation effort."
                    name="remove-duplicates"
                  />
                }
                label="Remove Duplicates"
              />
            </FormGroup>
          </FormControl>
          <Autocomplete
            clearIcon={false}
            size="small"
            options={[]}
            freeSolo
            fullWidth
            multiple
            value={values["preprocessRemoveContent"]}
            onChange={(e, value) => {
              updateValue("preprocessRemoveContent", value);
            }}
            renderTags={(value, props) =>
              value.map((option, index) => (
                <StyledChip label={option} {...props({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                label="Add content to remove (case sensitive)"
                {...params}
              />
            )}
          />
        </Grid>
      </Grid>

      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12}>
          <TextField
            id="outlined-multiline-flexible"
            label="Corpus Preview"
            multiline
            maxRows={10}
            value={previewContent}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

const iconStyle = {
  margin: "0rem 0.25rem",
  fontSize: "1rem",
};

const MetricWithDiff = ({
  actionAppliedToCorpus,
  originalCorpusDetails,
  corpusDetails,
  name,
}) => {
  const comparisonResult = useMemo(() => {
    const originalValue = originalCorpusDetails[name];
    const newValue = corpusDetails[name];
    const difference = Math.abs(
      ((originalValue - newValue) * 100) / originalValue
    );
    const isDecreased = originalValue > newValue;

    return {
      isChanged: originalValue !== newValue,
      color: isDecreased ? "#2e7d32" : "#c62828",
      icon: isDecreased ? (
        <ArrowDownwardIcon sx={iconStyle} />
      ) : (
        <ArrowUpwardIcon sx={iconStyle} />
      ),
      difference: Math.round(difference),
    };
  }, [originalCorpusDetails[name], corpusDetails[name]]);

  if (!name) {
    return <Skeleton width={30} />;
  }

  if (actionAppliedToCorpus && originalCorpusDetails[name]) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-evenly"
      >
        <Stack direction="row" alignItems="center">
          <Typography color="text.secondary">
            {originalCorpusDetails[name].toLocaleString()}
          </Typography>
          <ArrowRightAltIcon sx={iconStyle} />
          <Typography>{corpusDetails[name].toLocaleString()}</Typography>
          {comparisonResult.isChanged && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                fontSize: "0.75rem",
                color: comparisonResult.color,
              }}
            >
              {comparisonResult.icon}
              {comparisonResult.difference}%
            </Stack>
          )}
        </Stack>
      </Box>
    );
  } else {
    return (
      <Typography fontWeight="bold">
        {corpusDetails[name].toLocaleString()}
      </Typography>
    );
  }
};

export default Preprocessing;
