import "./App.css";

import React from "react";
import { Router, Switch, Route } from "react-router-dom";

import Login from "./common/auth/Login";
import SignUp from "./common/auth/SignUp";
import { Landing } from "./landing/landing";
import { Project } from "./features/project/project";
import { Feed } from "./features/feed/feed";
import { PortalModal } from "./features/project/modalportal";

import { AuthProvider } from "./common/auth/AuthContext";
import ProtectedRoute from "./common/auth/ProtectedRoute";
import Unauthorized from "./common/auth/Unauthorized";
import history from "./common/utils/history";

import { Helmet } from "react-helmet";

function App() {
  return (
    <Router history={history}>
      <AuthProvider>
        <Switch>
          <ProtectedRoute path="/project/:projectId/page/:pageNumber">
            <Helmet>
              <title>Annotation | LexiClean</title>
            </Helmet>
            <Project />
            <PortalModal />
          </ProtectedRoute>
          <ProtectedRoute path="/feed">
            <Helmet>
              <title>Project Feed | LexiClean</title>
            </Helmet>

            <Feed />
            <PortalModal />
          </ProtectedRoute>

          <Route exact path="/unauthorized" component={Unauthorized} />

          <Route exact path="/login">
            <Helmet>
              <title>Login | LexiClean</title>
            </Helmet>
            <Login />
          </Route>
          <Route exact path="/signup">
            <Helmet>
              <title>Signup | LexiClean</title>
            </Helmet>
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
