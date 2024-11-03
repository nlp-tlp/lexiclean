// ThemeToggleButton.js
import React, { useContext } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { ThemeContext } from "../../context/ThemeContext";
import Brightness7Icon from "@mui/icons-material/Brightness7"; // icon for light theme
import Brightness4Icon from "@mui/icons-material/Brightness4"; // icon for dark theme

const ThemeToggleButton = () => {
  const { toggleTheme, mode } = useContext(ThemeContext);

  return (
    <Tooltip title="Toggle light/dark mode">
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
