import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";


import Login from './components/auth/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'
import useToken from './components/auth/useToken'
import Unauthorized from './components/auth/Unauthorized';
import Landing from './pages/Landing'
import Project from './components/Project'
import ProjectFeed from './components/ProjectFeed'

function App() {
  const { token, setToken } = useToken();
  console.log('token ->', token);
  const logout = () => {localStorage.removeItem("token"); setToken(null);}

  return (
    <Router>
      <Switch>
        <ProtectedRoute exact path="/project/:projectId" token={token} logout={logout} component={Project}/>
        <ProtectedRoute exact path="/feed" token={token} logout={logout} component={ProjectFeed} />
        <Route exact path="/unauthorized" component={Unauthorized}/>
        <Route exact path="/login">
          <Login token={token} setToken={setToken} />
        </Route>
        <Route exact path="/">
          <Landing logout={logout}/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
