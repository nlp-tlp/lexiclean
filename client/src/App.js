import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Project from './components/Project'

import ProjectFeed from './components/ProjectFeed'



function App() {
  return (
    <Router>
      <Switch>

        <Route path="/project/:projectId">
          <Project/>
        </Route>

        <Route path="/">
          <ProjectFeed />
        </Route>

      </Switch>
    </Router>
  );
}

export default App;
