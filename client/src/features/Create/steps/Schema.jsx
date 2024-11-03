import React from "react";
import SchemaEditor from "../../../shared/components/SchemeEditor";
import { Alert, AlertTitle, Box, Grid } from "@mui/material";

const Schema = ({ values, updateValue }) => {
  return (
    <>
      <Box p={1}>
        <Grid item xs={12} pb={2}>
          <Alert severity="info">
            <AlertTitle>Tip!</AlertTitle>
            Here you can create a schema of entity tags for token-level entity
            tagging to support your annotation project. To create a tag enter a
            name, to update a tag click on it from the list and make changes, to
            delete a tag click on the delete icon.
          </Alert>
        </Grid>
      </Box>
      <SchemaEditor values={values} updateValue={updateValue} />
    </>
  );
};

export default Schema;
