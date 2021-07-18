import "./App.css";

import React from "react";
import { Router, Switch, Route } from "react-router-dom";

import Login from "./common/auth/Login";
import SignUp from "./common/auth/SignUp";
import Landing from "./landing";

import Project from "./project";
import ProjectFeed from "./feed";

import { AuthProvider } from "./common/auth/AuthContext";
import ProtectedRoute from "./common/auth/ProtectedRoute";
import Unauthorized from "./common/auth/Unauthorized";
import history from "./common/utils/history";

function App() {
  return (
    <Router history={history}>
      <AuthProvider>
        <Switch>
          <ProtectedRoute path="/project/:projectId/page/:pageNumber">
            <Project />
          </ProtectedRoute>

          <ProtectedRoute path="/feed">
            <ProjectFeed />
          </ProtectedRoute>

          <Route exact path="/unauthorized" component={Unauthorized} />
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/signup">
            <SignUp />
          </Route>
          <Route exact path="/">
            <Landing />
          </Route>
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;
