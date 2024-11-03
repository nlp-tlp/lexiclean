import { useState } from "react";
import { Box, CssBaseline, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import CustomAppBar from "./AppBar";
import PrimarySidebar from "./PrimarySidebar";

const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  return (
    <Box display="flex">
      <CssBaseline />
      <CustomAppBar drawerOpen={drawerOpen} handleDrawerToggle={toggleDrawer} />
      <PrimarySidebar
        drawerOpen={drawerOpen}
        handleDrawerToggle={toggleDrawer}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          backgroundColor: "background.light",
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
