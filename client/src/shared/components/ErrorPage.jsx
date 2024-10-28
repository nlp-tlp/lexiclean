import { Box, Paper } from "@mui/material";

const ErrorPage = () => {
  return (
    <Box
      id="error-page"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.light",
      }}
    >
      <Box
        as={Paper}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        p={2}
      >
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <a href="/" alt="home">
          Return home
        </a>
      </Box>
    </Box>
  );
};

export default ErrorPage;
