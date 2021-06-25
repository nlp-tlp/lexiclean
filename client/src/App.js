import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import ProtectedRoute from './components/auth/ProtectedRoute'
import useToken from './components/auth/useToken'
import Unauthorized from './components/auth/Unauthorized';
import Landing from './pages/Landing'
import Project from './components/Project'
import ProjectFeed from './components/ProjectFeed'

function App() {
  const { token, setToken } = useToken();
  const logout = () => {localStorage.removeItem("token"); setToken(null);}

  // console.log('app js', token);

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
