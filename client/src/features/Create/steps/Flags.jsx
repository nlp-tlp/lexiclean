import { Box, Grid, Alert, AlertTitle } from "@mui/material";
import FlagEditor from "../../../shared/components/FlagEditor";

const Flags = ({ values, updateValue }) => {
  return (
    <>
      <Box p={1}>
        <Grid item xs={12} pb={2}>
          <Alert severity="info">
            <AlertTitle>Tip!</AlertTitle>
            Flags are powerful tools for highlighting texts that require extra
            attention—be it for uncertainty, the need for further clarification,
            or quality enhancement. For instance, flag texts that seem ambiguous
            or might benefit from a second review. To create a flag, simply
            enter its name and left-click "add".
          </Alert>
        </Grid>
      </Box>
      <FlagEditor values={values.flags} updateValue={updateValue} />
    </>
  );
};

export default Flags;
