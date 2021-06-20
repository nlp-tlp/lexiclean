import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";


import Login from './components/auth/Login'
import useToken from './components/auth/useToken'
import Landing from './pages/Landing'
import Project from './components/Project'
import ProjectFeed from './components/ProjectFeed'


function App() {
  const {token, setToken } = useToken();

  console.log(window.location.pathname);

  if (window.location.pathname === '/'){
    return <Landing />
  } else if(!token){
    return <Login setToken={setToken}/>
  }

  return (
    <Router>
      <Switch>
        <Route path="/project/:projectId">
          <Project/>
        </Route>

        <Route path="/feed">
          <ProjectFeed />
        </Route>

        {/* <Route path="/">
          <Landing/>
        </Route> */}

      </Switch>
    </Router>
  );
}

export default App;
