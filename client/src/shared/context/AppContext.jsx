// This context will manage the user, their preferences, notifications, etc.
import React, { createContext, useContext, useEffect, useReducer } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import useNotificationActions from "../hooks/api/notification";

// Initial state
const initialState = {
  user: null, // User account information
  notifications: [], // User notifications
  preferences: {}, // User preferences
  token: null,
};

// Create context
const AppContext = createContext();

// Define a reducer
function appReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "LOGOUT_USER":
      return { ...initialState };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload };
    case "SET_PREFERENCES":
      return { ...state, preferences: action.payload };
    default:
      return state;
  }
}

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated, user, getAccessToken } = useAuth();

  const { notificationsQuery } = useNotificationActions();

  useEffect(() => {
    if (notificationsQuery.data) {
      dispatch({ type: "SET_NOTIFICATIONS", payload: notificationsQuery.data });
    }
  }, [notificationsQuery.data]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch additional user data based on user information
      async function fetchUserData() {
        try {
          const authToken = await getAccessToken();

          const response = await axiosInstance.get("/users/profile", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (response.status !== 200) {
            throw new Error("Failed to fetch user data");
          }
          const userData = await response.data;
          dispatch({ type: "SET_USER", payload: userData });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      fetchUserData();
    } else {
      // Handle logout
      dispatch({ type: "LOGOUT_USER" });
    }
  }, [isAuthenticated, user]);

  // Value to be passed to the provider
  const value = { state, dispatch };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useAppContext() {
  return useContext(AppContext);
}
