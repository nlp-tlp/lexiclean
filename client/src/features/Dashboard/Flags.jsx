import React from "react";
import StyledCard from "../../shared/components/StyledCard";
import FlagEditor from "../../shared/components/FlagEditor";
import { Alert, AlertTitle, Box } from "@mui/material";

const Flags = ({
  loading,
  data,
  handleUpdate,
  createFunction,
  updateFunction,
  deleteFunction,
  disabled = false,
}) => {
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <StyledCard
      title="Flags"
      id="dashboard-flags"
      caption="Flags used on this project"
    >
      <Box p="0rem 1rem">
        <Alert severity="warning">
          <AlertTitle>Important: Manage Flags Carefully</AlertTitle>
          This section allows you to create, update, and delete flags for your
          project. Be aware that deleting a flag will also remove all related
          annotations from texts. Proceed with caution to avoid unintended loss
          of data.
        </Alert>
      </Box>
      <Box p={2}>
        <FlagEditor
          values={data.details.flags.map((f) => f.name)}
          updateValue={handleUpdate}
          createFunction={createFunction}
          updateFunction={updateFunction}
          deleteFunction={deleteFunction}
          disabled={disabled}
        />
      </Box>
    </StyledCard>
  );
};

export default Flags;
