import {
  Autocomplete,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { StyledChip } from "../../Dashboard/Details";

const Details = ({ values, updateValue }) => {
  return (
    <Stack direction="column" spacing={2}>
      <CustomTextField
        value={values["projectName"]}
        setValueFunction={(targetValue) =>
          updateValue("projectName", targetValue)
        }
        title="Project Name"
        caption="Choose a distinctive name for your project. You can change this later."
        placeholder="Enter a project name"
      />
      <CustomTextField
        value={values.projectDescription}
        setValueFunction={(targetValue) =>
          updateValue("projectDescription", targetValue)
        }
        title="Project Description"
        caption="Describe your project to provide context for annotators. You can edit this description at any time."
        placeholder="Enter a brief description"
      />
      <Grid>
        <Grid item xs={12} pr={4}>
          <Typography color="text.secondary">
            Are there any special tokens in your project?
          </Typography>
          <Typography variant="caption">
            Enter your special tokens (e.g., &lt;id&gt;, &lt;sensitive&gt;).
            Press enter to accept them. These tokens will be recognised as part
            of the vocabulary when your project is created.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            clearIcon={false}
            size="small"
            options={[]}
            freeSolo
            fullWidth
            multiple
            value={values["specialTokens"]}
            onChange={(e, value) => {
              updateValue("specialTokens", value);
            }}
            renderTags={(value, props) =>
              value.map((option, index) => (
                <StyledChip label={option} {...props({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                placeholder="Enter special tokens here (e.g., <id>, <sensitive>)"
                {...params}
              />
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

const CustomTextField = ({
  value,
  setValueFunction,
  title,
  caption,
  placeholder,
}) => (
  <Grid container alignItems="center">
    <Grid item xs={12} pr={4}>
      <Typography color="text.secondary">{title}</Typography>
      <Typography variant="caption">{caption}</Typography>
    </Grid>
    <Grid item xs={12}>
      <TextField
        key={`${title}-textfield"`}
        type="text"
        margin="normal"
        fullWidth
        placeholder={placeholder}
        value={value}
        autoComplete="false"
        onChange={(e) => setValueFunction(e.target.value)}
        size="small"
      />
    </Grid>
  </Grid>
);

export default Details;
