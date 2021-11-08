import React from "react";
import { Helmet } from "react-helmet";
import { Route, Router, Switch } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./features/auth/authcontext";
import { Login } from "./features/auth/login";
import { ProtectedRoute } from "./features/auth/protectedroute";
import { SignUp } from "./features/auth/signup";
import { Unauthorized } from "./features/auth/unauthorized";
import { Footer } from "./features/common/footer";
import { NavBar } from "./features/common/navbar";
import { Feed } from "./features/feed/feed";
import { Landing } from "./features/landing/landing";
import { PortalModal } from "./features/modals/modalportal";
import { Create } from "./features/project/create/create";
import { Project } from "./features/project/project";
import history from "./features/utils/history";

function App() {
  return (
    <Router history={history}>
      <AuthProvider>
        <Switch>
          <ProtectedRoute path="/project/:projectId/page/:pageNumber">
            <Helmet>
              <title>Annotation | LexiClean</title>
            </Helmet>
            <NavBar />
            <Project />
            <Footer />
            <PortalModal />
          </ProtectedRoute>

          <ProtectedRoute path="/project/new">
            <Helmet>
              <title>New Project | LexiClean</title>
            </Helmet>
            <NavBar />
            <Create />
            <Footer />
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
          <Route path="/">
            <Helmet>
              <title>LexiClean | Multi-task Lexnorm Annotation</title>
            </Helmet>
            <Landing />
          </Route>
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;
