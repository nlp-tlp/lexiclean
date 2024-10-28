// CustomSnackbar.js
import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useSnackbar } from "../context/SnackbarContext";

const CustomSnackbar = () => {
  const {
    state: { open, message, severity },
    dispatch,
  } = useSnackbar();

  const handleClose = () => {
    dispatch({ type: "HIDE" });
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
