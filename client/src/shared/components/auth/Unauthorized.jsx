import React from "react";
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

const Unauthorized = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "100vh",
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <Card
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            py: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LockIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            Access Denied
          </Typography>
        </Box>
        <CardContent sx={{ py: 4 }}>
          <UnauthorizedContent />
        </CardContent>
        <CardActions sx={{ justifyContent: "center", pb: 3 }}>
          <ReturnAction />
        </CardActions>
      </Card>
    </Grid>
  );
};

const ReturnAction = () => {
  return (
    <Button
      component={Link}
      to="/"
      variant="contained"
      color="primary"
      size="large"
    >
      Return to Home Page
    </Button>
  );
};

const UnauthorizedContent = () => {
  return (
    <Typography variant="body1" align="center" color="text.secondary">
      We're sorry, but you don't have permission to access this page. Please
      ensure you're logged in with the appropriate credentials or contact the
      system administrator if you believe this is an error.
    </Typography>
  );
};

export default Unauthorized;
