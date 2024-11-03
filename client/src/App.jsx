import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Landing from "./features/Landing";
import Projects from "./features/Projects";
import Create from "./features/Create";
import Project from "./features/Project";
import Layout from "./shared/components/Layout";
import Dashboard from "./features/Dashboard";
import CustomSnackbar from "./shared/components/CustomSnackbar";
import SnackbarProvider from "./shared/context/SnackbarContext";
import { ThemeProvider } from "./shared/context/ThemeContext";
import { AppProvider } from "./shared/context/AppContext";
import ErrorPage from "./shared/components/ErrorPage";
import { ModalProvider } from "./shared/context/ModalContext";
import Account from "./features/Account";
import AuthPage from "./shared/components/auth/AuthPage";
import { ProjectProvider } from "./shared/context/ProjectContext";
import { ErrorBoundaryProvider } from "./shared/context/ErrorBoundaryContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./shared/context/AuthContext";
import ProtectedRoute from "./shared/components/auth/ProtectedRoute";
import Unauthorized from "./shared/components/auth/Unauthorized";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SnackbarProvider>
              <ModalProvider>
                <AppProvider>
                  <ProjectProvider>
                    <CustomSnackbar />
                    <ErrorBoundaryProvider>
                      <Routes>
                        <Route path="/auth" element={<AuthPage />} />
                        <Route index element={<Landing />} />
                        <Route
                          path="/project/:projectId"
                          element={
                            <ProtectedRoute>
                              <Project />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/" element={<Layout />}>
                          <Route
                            path="/projects"
                            element={
                              <ProtectedRoute>
                                <Projects />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            exact
                            path="/project/create"
                            element={
                              <ProtectedRoute>
                                <Create />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/:projectId"
                            element={
                              <ProtectedRoute>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/account"
                            element={
                              <ProtectedRoute>
                                <Account />
                              </ProtectedRoute>
                            }
                          />
                        </Route>
                        {/* Catch-all route for undefined paths */}
                        <Route
                          path="/unauthorized"
                          element={<Unauthorized />}
                        />
                        <Route path="/error" element={<ErrorPage />} />
                        <Route path="*" element={<ErrorPage />} />
                      </Routes>
                    </ErrorBoundaryProvider>
                  </ProjectProvider>
                </AppProvider>
              </ModalProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
