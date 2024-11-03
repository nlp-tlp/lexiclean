import {
  Grid,
  Chip,
  Stack,
  Box,
  Typography,
  Alert,
  AlertTitle,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  getCorpusLength,
  normaliseSpecialTokens,
} from "../../../shared/utils/create";

const Review = (props) => {
  const { values, stepValidation } = props;

  const preprocessingActions = {
    preprocessLowerCase: {
      applied: values["preprocessLowerCase"],
      name: "Lower Case",
    },
    preprocessRemoveChars: {
      applied: values["preprocessRemoveChars"],
      name: "Remove Special Characters",
    },
    preprocessRemoveDuplicates: {
      applied: values["preprocessRemoveDuplicates"],
      name: "Remove Duplicates",
    },
  };

  const data = {
    details: {
      summary: [
        `Name: ${values["projectName"]}`,
        `Description: ${values["projectDescription"]}`,
      ],
    },
    schema: {
      summary: [
        `Tags: ${
          values["tags"].length === 0
            ? "None created"
            : values["tags"].map((t) => t.name).join(", ")
        }`,
      ],
    },
    upload: {
      summary: [
        `Upload Type: ${values["corpusType"]}`,
        `Documents Uploaded: ${getCorpusLength(values["corpus"])}`,
        ...(values["corpusType"] === "parallel"
          ? [
              values["specialTokens"] === ""
                ? "Special Tokens: None specified"
                : `Special Tokens: ${normaliseSpecialTokens(
                    values["specialTokens"]
                  ).join(",")}`,
            ]
          : []),
      ],
    },
    preprocessing: {
      summary:
        Object.keys(preprocessingActions).filter(
          (action) => preprocessingActions[action].applied
        ).length === 0
          ? ["No Actions Applied"]
          : Object.keys(preprocessingActions)
              .filter((action) => preprocessingActions[action].applied)
              .map((action) => preprocessingActions[action].name),
    },
    preannotation: {
      summary: ["Coming soon"],
    },
  };

  return (
    <Grid item xs={12}>
      {Object.keys(data)
        .filter((step) =>
          values["corpusType"] === "annotation"
            ? !["preprocessing", "preannotation"].includes(step)
            : step
        )
        .map((step) => (
          <Box mt={2} key={`review-container-${step}`}>
            <Alert
              severity={stepValidation[step] ? "success" : "error"}
              action={
                <Button
                  color="inherit"
                  size="small"
                  component={Link}
                  to={`/project/new/${step}`}
                >
                  {stepValidation[step] ? "REVIEW" : "FIX"}
                </Button>
              }
            >
              <AlertTitle sx={{ textTransform: "capitalize" }}>
                {step}
              </AlertTitle>
              <Stack direction="row" spacing={2}>
                {data[step].summary
                  .filter((i) => i) // Remove nulls
                  .map((item, index) => (
                    <Chip
                      key={`review-${step}-chip-${index}`}
                      label={item}
                      size="small"
                    />
                  ))}
              </Stack>
            </Alert>
          </Box>
        ))}
      <Box mt={1}>
        <Typography variant="caption">
          Project creation may take a few minutes if a lot of data has been
          uploaded
        </Typography>
      </Box>
    </Grid>
  );
};

export default Review;
