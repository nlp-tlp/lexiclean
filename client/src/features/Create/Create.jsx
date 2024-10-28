import { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Divider,
  Paper,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Details from "./steps/Details";
import Upload from "./steps/upload/Upload";
import Preprocessing from "./steps/Preprocessing";
import Schema from "./steps/Schema";
import Preannotation from "./steps/Preannotation";
import DoneIcon from "@mui/icons-material/Done";
import WarningIcon from "@mui/icons-material/Warning";
import {
  ValidateCreateDetails,
  ValidateCreateSchema,
  ValidateCreateUpload,
  ValidateCreatePreannotation,
  ValidateCreateReview,
  ValidateCreateReplacements,
} from "../../shared/utils/validation";
import useProjectActions from "../../shared/hooks/api/project";
import Flags from "./steps/Flags";
import Replacements from "./steps/Replacements";

const CreateProject = () => {
  const { createProject } = useProjectActions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stepValidation, setStepValidation] = useState({
    details: false,
    upload: false,
    preprocessing: false,
    replacements: false,
    schema: false,
    flags: true,
    preannotation: true,
    review: false,
  });

  const updateStepValidation = (step, valid) => {
    setStepValidation((prevState) => ({ ...prevState, [step]: valid }));
  };

  const initialState = {
    projectName: "",
    projectDescription: "",
    specialTokens: [],
    corpusType: "standard", // Indicates type of data uploaded ('standard', 'identifiers', 'parallel')
    corpusFileName: null,
    corpus: [],
    preprocessLowerCase: false,
    preprocessRemoveDuplicates: false,
    preprocessRemoveContent: [],
    replacementDictionary: "{}",
    preprocessRemovePunctuation: false,
    replacementDictionaryFileName: null,
    tags: [],
    flags: [],
    preannotationReplacements: true,
    preannotationSchema: false,
    preannotationDigits: false,
    preannotationRanking: true,
  };

  const [values, setValues] = useState(initialState);

  const handleReset = () => {
    setValues(initialState);
  };

  const updateValue = (key, value) => {
    setValues((prevState) => ({ ...prevState, [key]: value }));
  };

  const steps = {
    details: {
      component: <Details values={values} updateValue={updateValue} />,
      description: "Enter project details",
      title: "Details",
      valid: stepValidation.details,
    },
    upload: {
      component: <Upload values={values} updateValue={updateValue} />,
      description: "Create or upload a corpus",
      title: "Data",
      valid: stepValidation.upload,
    },
    preprocessing: {
      component: <Preprocessing values={values} updateValue={updateValue} />,
      description: "Apply text preprocessing to your corpus",
      title: "Preprocessing",
      valid: stepValidation.preprocessing,
    },
    replacements: {
      component: <Replacements values={values} updateValue={updateValue} />,
      description: "Create or upload a replacement dictionary.",
      title: "Replacements",
      valid: stepValidation.replacements,
    },
    schema: {
      component: <Schema values={values} updateValue={updateValue} />,
      description: "Build a schema for multi-task token annotation",
      title: "Schema",
      valid: stepValidation.schema,
    },
    flags: {
      component: <Flags values={values} updateValue={updateValue} />,
      description: "Specify a set of flags which can be applied to texts",
      title: "Flags",
      valid: stepValidation.flags,
    },
    preannotation: {
      component: <Preannotation values={values} updateValue={updateValue} />,
      description: "Upload data for pre-annotation",
      title: "Settings",
      valid: stepValidation.preannotation,
    },
  };

  const stepDisabled = (key) => {
    return (
      ["preprocessing", "preannotation"].includes(key) &&
      values["corpusType"] === "parallel"
    );
  };

  const stepSuccessful = (key) => {
    return stepValidation[key] && !stepDisabled(key);
  };

  useEffect(() => {
    const detailsValid = ValidateCreateDetails(
      values["projectName"],
      values["projectDescription"]
    );
    updateStepValidation("details", detailsValid);

    // ValidateCreateSchema (nothing to check)
    const schemaValid = ValidateCreateSchema();
    updateStepValidation("schema", schemaValid);

    const uploadValid = ValidateCreateUpload(values["corpus"]);
    updateStepValidation("upload", uploadValid);
    // Preprocessing is valid as long as upload is valid
    updateStepValidation("preprocessing", uploadValid);

    const preannotationValid = ValidateCreatePreannotation(
      values["replacementDictionary"]
    );
    updateStepValidation("preannotation", preannotationValid);

    const replacementsValid = ValidateCreateReplacements(
      values["replacementDictionary"]
    );
    updateStepValidation("replacements", replacementsValid);

    const reviewValid = ValidateCreateReview(
      detailsValid,
      schemaValid,
      uploadValid,
      preannotationValid,
      replacementsValid
    );

    updateStepValidation("review", reviewValid);
  }, [values]);

  const handleSubmit = async () => {
    try {
      const payload = {
        name: values.projectName,
        description: values.projectDescription,
        corpus: {
          type: values.corpusType,
          filename: values.corpusFileName,
        },
        replacements: {
          values: JSON.parse(values.replacementDictionary),
        },
        settings: {
          special_tokens: values.specialTokens,
          digits_in_vocab: values.preannotationDigits,
          preprocessing: {
            lowercase: values.preprocessLowerCase,
            remove_duplicates: values.preprocessRemoveDuplicates,
            remove_content: values.preprocessRemoveContent,
            remove_punctuation: values.preprocessRemovePunctuation,
          },
          ranking: values.preannotationRanking,
          preannotation: {
            replacements: values.preannotationReplacements,
            suggested: true,
            tags: values.preannotationSchema,
          },
        },
        flags: values.flags.map((f) => ({
          name: f,
        })),
        tags: values.tags.map((t) => ({
          name: t.name,
          color: t.color,
          description: t.description,
          values: t.data,
        })),
        annotators: [],
        texts: values.corpus,
      };

      setIsSubmitting(true);
      await createProject(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid
      container
      direction="column"
      sx={{ height: "calc(100vh - 128px)", overflow: "hidden" }}
    >
      <Grid
        container
        item
        xs
        sx={{ overflow: "auto" }}
        spacing={4}
        mt={1}
        mb={1}
      >
        {Object.values(steps).map((s) => (
          <Grid item xs={12}>
            <StepContainer title={s.title} valid={s.valid}>
              {s.component}
            </StepContainer>
          </Grid>
        ))}
      </Grid>
      {/* STICKY FOOTER */}
      <Grid item xs="auto">
        <Paper variant="outlined">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            p="0.5rem 1rem"
            spacing={1}
          >
            <Typography variant="body2">
              Note: Project creation may take a few minutes if a lot of data has
              been uploaded
            </Typography>
            <Stack direction="row" spacing={2}>
              <LoadingButton
                variant="contained"
                loading={isSubmitting}
                onClick={handleSubmit}
                disabled={!stepValidation.review}
              >
                Create Project
              </LoadingButton>
              <Button onClick={handleReset}>Start Over</Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

const StepContainer = ({ title, valid, children }) => {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mr={1}
        >
          <Typography variant="h6" sx={{ p: 2, color: "text.secondary" }}>
            {title}
          </Typography>
          <Chip
            label={valid ? "Input valid" : "Input required"}
            color={valid ? "success" : "warning"}
            variant="outlined"
            icon={valid ? <DoneIcon /> : <WarningIcon />}
          />
        </Box>
        <Divider flexItem />
      </Box>
      <Box p={2}>{children}</Box>
      <Box sx={{ backgroundColor: "background.accent", height: 32 }} />
    </Paper>
  );
};

export default CreateProject;
