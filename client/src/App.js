import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Login from './common/auth/Login'
import SignUp from './common/auth/SignUp'
import ProtectedRoute from './common/auth/ProtectedRoute'
import useToken from './common/auth/useToken'
import Unauthorized from './common/auth/Unauthorized';
import Landing from './landing'

import Project from './project'
import ProjectFeed from './feed'

function App() {
  const { token, setToken } = useToken();

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("id");
    localStorage.removeItem("replacements");
  }

  return (
    <Router>
      <Switch>
        <ProtectedRoute exact path="/project/:projectId/page/:pageNumber" token={token} logout={logout} component={Project}/>
        <ProtectedRoute exact path="/feed" token={token} setToken={setToken} component={ProjectFeed} />
        <Route exact path="/unauthorized" component={Unauthorized}/>
        <Route exact path="/login">
          <Login token={token} setToken={setToken}/>
        </Route>
        <Route exact path="/signup">
          <SignUp token={token} setToken={setToken}/>
        </Route>
        <Route exact path="/">
          <Landing token={token} logout={logout}/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
