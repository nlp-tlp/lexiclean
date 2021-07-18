import React, { useState, useEffect } from "react";
import axios from '../common/utils/api-interceptor'
import history from '../common/utils/history'

import { createUseStyles } from "react-jss";
import { Spinner, Button, Navbar } from "react-bootstrap";

import NavBar from "../common/components/navbar";
import ProjectList from "./ProjectList";
import UploadModal from "./modals/UploadModal";
import DeleteProjectModal from "./modals/DeleteProjectModal";
import AnnotateBeginModal from "./modals/AnnotateBeginModal";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "80vh",
    minHeight: "100%",
    marginBottom: "5em",
  },
});

export default function ProjectFeed() {
  const classes = useStyles();

  const username = localStorage.getItem("username");

  const [projects, setProjects] = useState();
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState();

  const [showAnnotate, setShowAnnotate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showProjectDelete, setShowProjectDelete] = useState(false);

  // const logout = () => {
  //     setToken(null);
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("username");
  //     localStorage.removeItem("id");
  //     localStorage.removeItem("replacements");
  //     history.push("/");
  // }

  useEffect(() => {
    // Fetches project on page load and when upload modal is interacted with.
    const fetchProjects = async () => {
      await axios
        .get("/api/project/feed")
        .then((response) => {
            console.log(response)
          if (response.status === 200) {
            console.log("projects", response.data);
            setProjects(response.data);
            setProjectsLoaded(true);
          }
        })
        .catch((error) => {
            console.log(error)
          if (error.response.status === 401 || 403) {
            console.log("unauthorized");
            history.push("/unauthorized");
          }
        });
    };
    fetchProjects();
  }, [projectsLoaded, showUpload, showProjectDelete]);

  return (
    <>
      {showUpload && (
        <UploadModal showUpload={showUpload} setShowUpload={setShowUpload} />
      )}

      {showProjectDelete && (
        <DeleteProjectModal
          showProjectDelete={showProjectDelete}
          setShowProjectDelete={setShowProjectDelete}
          selectedProject={selectedProject}
        />
      )}

      {showAnnotate && (
        <AnnotateBeginModal
          showAnnotate={showAnnotate}
          setShowAnnotate={setShowAnnotate}
          selectedProject={selectedProject}
        />
      )}

      <NavBar
        username={username}
        setShowUpload={setShowUpload}
      />

      <div className={classes.container} id="container-feed">
        <h1
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            fontWeight: "bold",
          }}
        >
          Project Feed
        </h1>
        {!projectsLoaded ? (
          <div style={{ margin: "auto", marginTop: "5em" }}>
            <Spinner animation="border" />
          </div>
        ) : projects.length === 0 ? (
          <div
            style={{
              margin: "auto",
              textAlign: "center",
              marginTop: "5em",
              fontSize: "2em",
            }}
          >
            <p>No projects</p>
            <Button
              variant="dark"
              size="lg"
              onClick={() => setShowUpload(true)}
            >
              Create Project
            </Button>
          </div>
        ) : (
          <ProjectList
            projects={projects}
            setSelectedProject={setSelectedProject}
            setShowAnnotate={setShowAnnotate}
            setShowProjectDelete={setShowProjectDelete}
          />
        )}
      </div>

      <Navbar bg="light" fixed="bottom">
        <Navbar.Text className="m-auto">© UWA NLP-TLP Group 2021.</Navbar.Text>
      </Navbar>
    </>
  );
}
