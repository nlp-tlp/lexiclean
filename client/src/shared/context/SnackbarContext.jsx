// SnackbarContext.js
import { createContext, useContext, useReducer } from "react";

const SnackbarContext = createContext();

const snackbarReducer = (state, action) => {
  switch (action.type) {
    case "SHOW":
      return {
        ...state,
        open: true,
        message: action.message,
        severity: action.severity,
      };
    case "HIDE":
      return { ...state, open: false };
    default:
      return state;
  }
};

const SnackbarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(snackbarReducer, {
    open: false,
    message: "",
    severity: "info", // or 'error', 'warning', 'info', 'success'
  });

  const value = { state, dispatch };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);

export default SnackbarProvider;
