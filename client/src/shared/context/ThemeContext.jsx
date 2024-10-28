// ThemeContext.js
import React, { createContext, useState, useMemo } from "react";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { teal, grey, orange, blue, green, red } from "@mui/material/colors";
import { lighten, alpha } from "@mui/material/styles";

export const ThemeContext = createContext({
  toggleTheme: () => {},
  mode: "light",
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem("theme") || "light");

  const colorMode = useMemo(
    () => ({
      toggleTheme: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("theme", newMode); // Save the new theme to localStorage
          return newMode;
        });
      },
      mode, // Provide the mode so it can be used in the context
    }),
    [mode]
  );

  const getDesignTokens = (mode) => ({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // palette values for light mode
            primary: { main: teal[700], light: teal[300] },
            secondary: { main: "#19857b" },
            background: {
              default: "#fff",
              paper: "#fff",
              light: grey[100],
              accent: lighten(teal[50], 0.5),
              dark: grey[200],
              darker: grey[300],
              active: lighten(teal[100], 0.5),
            },
            borders: {
              primary: "#e0e0e0",
              accent: teal[800],
            },
            text: {
              primary: "#000",
              secondary: "#616161",
              brandText: teal[800],
              active: teal[800],
            },
            token: {
              iv: "#000",
              oov: orange[500],
              suggestion: blue[500],
              editing: green[500],
              strike: red[500],
              replacement: green[500],
              empty: red[500],
            },
          }
        : {
            // palette values for dark mode
            primary: { main: teal[400] },
            secondary: { main: "#f48fb1" },
            background: {
              default: "#121212",
              paper: "#121212",
              light: grey[900],
              accent: alpha(teal[50], 0.1),
              darker: "#1a1a1a",
              active: alpha(teal[500], 0.2),
            },
            borders: {
              primary: "#424242",
              accent: teal[300],
            },
            text: {
              primary: "#fff",
              secondary: "rgba(255, 255, 255, 0.7)",
              brandText: teal[500],
              active: "rgba(255, 255, 255, 0.7)",
            },
            token: {
              iv: "#fff",
              oov: orange[500],
              suggestion: blue[500],
              editing: green[500],
              strike: red[500],
              replacement: green[500],
              empty: red[500],
            },
          }),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
        /* Styles for WebKit-based browsers like Chrome and Safari */
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: ${mode === "light" ? "#f1f1f1" : "#212121"};
        }
        ::-webkit-scrollbar-thumb {
          background-color: ${mode === "light" ? "#888" : "#4f4f4f"};
          border-radius: 10px;
          border: 2px solid ${mode === "light" ? "#f1f1f1" : "#212121"};
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${mode === "light" ? "#555" : "#6b6b6b"};
        }

        /* Styles for Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: ${
            mode === "light" ? "#888 #f1f1f1" : "#4f4f4f #212121"
          };
        }
      `,
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor:
                mode === "light" ? teal[50] : alpha(teal[800], 0.8),
            },
            borderRadius: "25%",
            backgroundColor:
              mode === "light" ? teal[50] : alpha(teal[800], 0.2),
            color: mode === "light" ? teal[700] : teal[50],
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor:
                mode === "light" ? teal[50] : alpha(teal[500], 0.2),
            },
            borderRadius: "1rem",
            marginBottom: "0.5rem",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor:
                mode === "light" ? teal[50] : alpha(teal[800], 0.2),
            },
            borderRadius: "1rem",
          },
        },
      },
    },
  });

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
