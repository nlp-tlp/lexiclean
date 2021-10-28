import "./App.css";

import React from "react";
import { Router, Switch, Route } from "react-router-dom";

import { Login } from "./features/auth/login";
import { SignUp } from "./features/auth/signup";
import { Landing } from "./features/landing/landing";
import { Project } from "./features/project/project";
import { Feed } from "./features/feed/feed";
import { PortalModal } from "./features/modals/modalportal";
import { NavBar } from "./features/common/navbar";
import { Footer } from "./features/common/footer";

import { AuthProvider } from "./features/auth/authcontext";
import { ProtectedRoute } from "./features/auth/protectedroute";
import { Unauthorized } from "./features/auth/unauthorized";
import history from "./features/utils/history";

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
            <NavBar />
            <Feed />
            <Footer />
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
            <NavBar />
            <Landing />
          </Route>
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;
