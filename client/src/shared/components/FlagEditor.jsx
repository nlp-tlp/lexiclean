import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { StyledChip } from "../../features/Dashboard/Details";

const FlagEditor = ({
  values,
  updateValue,
  createFunction = null,
  updateFunction = null,
  deleteFunction = null,
  disabled = false,
}) => {
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleFlagClick = (flag, index) => {
    if (index === editingIndex) {
      // Unselect flag
      resetForm();
    } else {
      setInput(flag);
      setIsEditing(true);
      setEditingIndex(index);
    }
  };

  const addFlag = () => {
    if (input.trim() === "") return; // Prevent adding empty flags
    if (values.includes(input.trim())) return; // Prevent duplicates when adding
    createFunction
      ? createFunction(input.trim())
      : updateValue("flags", [...values, input.trim()]);
    resetForm();
  };

  const updateFlag = () => {
    if (input.trim() === "") return; // Prevent adding empty flags
    const updatedFlags = [...values];
    const previousFlag = updatedFlags[editingIndex];
    updatedFlags[editingIndex] = input.trim();
    updateFunction
      ? updateFunction(previousFlag, input.trim())
      : updateValue("flags", updatedFlags);
    resetForm();
  };

  const removeFlag = (flagToRemove) => {
    const updatedFlags = values.filter((flag) => flag !== flagToRemove);
    deleteFunction
      ? deleteFunction(flagToRemove)
      : updateValue("flags", updatedFlags);
    if (isEditing) {
      resetForm();
    }
  };

  const resetForm = () => {
    setInput("");
    setIsEditing(false);
    setEditingIndex(-1);
  };

  return (
    <Grid container alignItems="center">
      <Grid item xs={12} mb={2}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          width="100%"
        >
          <TextField
            id="flag-input"
            size="small"
            label={isEditing ? "Edit Flag" : "New Flag"}
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (isEditing ? updateFlag : addFlag)
            }
            disabled={disabled}
          />
          <Button
            id={isEditing ? "update-flag" : "add-flag"}
            variant="contained"
            onClick={isEditing ? updateFlag : addFlag}
            size="small"
            disabled={
              input.trim() === "" || values.includes(input.trim()) || disabled
            }
          >
            {isEditing ? "Update" : "Add"}
          </Button>
          {isEditing && (
            <Button
              id="cancel-edit-flag"
              variant="outlined"
              onClick={resetForm}
              size="small"
              disabled={disabled}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          variant="outlined"
        >
          {values.length === 0 ? (
            <Typography variant="body2">No Flags Added</Typography>
          ) : (
            <Stack direction="row" spacing={1}>
              {values.map((flag, index) => (
                <StyledChip
                  key={index}
                  label={flag}
                  onClick={() => handleFlagClick(flag, index)}
                  onDelete={() => removeFlag(flag)}
                  disabled={disabled}
                  deletable
                  color={index === editingIndex ? "primary" : "default"}
                  variant={
                    index !== editingIndex && editingIndex !== -1
                      ? "contained"
                      : "outlined"
                  }
                />
              ))}
            </Stack>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FlagEditor;
