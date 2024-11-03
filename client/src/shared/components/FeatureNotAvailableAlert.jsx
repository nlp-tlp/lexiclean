import { Alert, AlertTitle } from "@mui/material";

const FeatureNotAvailableAlert = () => (
  <Alert severity="error">
    <AlertTitle>Warning</AlertTitle>
    This feature is currently disabled. Please be patient as we work to enable
    this feature.
  </Alert>
);

export default FeatureNotAvailableAlert;
