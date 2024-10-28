import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

const Preannotation = ({ values, updateValue }) => {
  return (
    <Stack direction="column" spacing={2}>
      <CustomCheckboxField
        title="Apply Replacement Dictionary Automatically?"
        caption="Enable this to auto-apply replacements to your corpus for faster annotation. You can revert these changes anytime."
        options={[
          {
            label: "Yes",
            value: true,
            checked: values.preannotationReplacements,
          },
          {
            label: "No",
            value: false,
            checked: !values.preannotationReplacements,
          },
        ]}
        setValueFunction={(targetValue) =>
          updateValue("preannotationReplacements", targetValue)
        }
      />
      <CustomCheckboxField
        title="Auto-label Words Using Your Schema?"
        caption="Activating this will apply your schema labels automatically to your corpus, accelerating the annotation process. Changes are reversible."
        options={[
          { label: "Yes", value: true, checked: values.preannotationSchema },
          { label: "No", value: false, checked: !values.preannotationSchema },
        ]}
        setValueFunction={(targetValue) =>
          updateValue("preannotationSchema", targetValue)
        }
      />
      <CustomCheckboxField
        title="Treat Digits as In-vocabulary?"
        caption="This treats numerical values (e.g., 1, 22, 388) as known vocabulary. Note: This action is permanent."
        options={[
          { label: "Yes", value: true, checked: values.preannotationDigits },
          { label: "No", value: false, checked: !values.preannotationDigits },
        ]}
        setValueFunction={(targetValue) =>
          updateValue("preannotationDigits", targetValue)
        }
      />
      <CustomCheckboxField
        title="Prioritise Texts with Inverse TF-IDF?"
        caption="LexiClean can prioritise your texts based on 'value-add' of normalisations, using an inverse tf-idf strategy on masked out-of-vocabulary tokens."
        options={[
          { label: "Yes", value: true, checked: values.preannotationRanking },
          { label: "No", value: false, checked: !values.preannotationRanking },
        ]}
        setValueFunction={(targetValue) =>
          updateValue("preannotationRanking", targetValue)
        }
      />
    </Stack>
  );
};

const CustomCheckboxField = ({
  title,
  caption,
  options = [],
  setValueFunction,
}) => {
  return (
    <Grid container alignItems="center">
      <Grid item xs={10} pr={4}>
        <Box display="flex" flexDirection="column">
          <Typography fontWeight={500} color="text.secondary">
            {title}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {caption}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          {options.map((option, index) => (
            <FormControlLabel
              key={`${title}-checkbox-${index}`}
              control={
                <Checkbox
                  checked={option.checked || false}
                  onChange={() => setValueFunction(option.value)}
                  name={option.label}
                />
              }
              label={option.label}
            />
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Preannotation;
