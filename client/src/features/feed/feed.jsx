import React, { useState, useEffect } from "react";
import { Spinner, Button, Navbar, ListGroup } from "react-bootstrap";
import { MdDelete, MdEdit, MdFileDownload } from "react-icons/md";
import { RiNumbersFill } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { setActiveModal } from "../project/projectSlice";
import {
  fetchProjects,
  fetchProjectMetrics,
  selectFeedStatus,
  selectFeedError,
  selectFeedMetricsStatus,
  selectFeedMetricsError,
  selectProjects,
  selectProjectMetrics,
  setActiveProject,
} from "../project/feedSlice";
import "./Feed.css";

import { NavBar } from "../common/navbar";

export const Feed = () => {
  const dispatch = useDispatch();
  const feedStatus = useSelector(selectFeedStatus);
  const feedError = useSelector(selectFeedError);
  const projects = useSelector(selectProjects);

  const feedMetricsStatus = useSelector(selectFeedMetricsStatus);
  const feedMetricsError = useSelector(selectFeedMetricsError);

  useEffect(() => {
    //   Needs to update when new project created or existing one is deleted
    if (feedStatus === "idle") {
      dispatch(fetchProjects());
    }
    if (feedMetricsStatus === "idle") {
      dispatch(fetchProjectMetrics());
    }
  }, [feedStatus, feedMetricsStatus, dispatch]);

  return (
    <>
      <NavBar />
      <div className="feed-container">
        {/* <h1 id="title">Projects Feed</h1> */}
        {feedStatus !== "succeeded" ? (
          <div id="loader">
            <Spinner animation="border" />
            <p>Loading...</p>
          </div>
        ) : projects.length === 0 ? (
          <div id="create-project">
            <p>No projects</p>
            <Button
              variant="dark"
              size="lg"
              onClick={() => dispatch(setActiveModal("create"))}
            >
              Create Project
            </Button>
          </div>
        ) : (
          <ProjectList />
        )}
      </div>

      <Navbar bg="light" fixed="bottom">
        <Navbar.Text className="m-auto">© UWA NLP-TLP Group 2021.</Navbar.Text>
      </Navbar>
    </>
  );
};

const ProjectList = () => {
  const DELETE_COLOUR = "#D95F69";
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects);
  const projectMetrics = useSelector(selectProjectMetrics);

  const modalHandler = (project, type) => {
    dispatch(setActiveProject(project));
    dispatch(setActiveModal(type));
  };

  return (
    <div className="project-list-container">
      <ListGroup>
        {projects.map((project, index) => {
          return (
            <>
              <ListGroup.Item action key={index}>
                <div id="list-item-container" key={index}>
                  <div
                    id="detail-container"
                    onClick={() => modalHandler(project, "annotate")}
                    key={index}
                  >
                    <h1 id="project-name">{project.name}</h1>
                    <p id="description">{project.description}</p>
                    <p id="project-creation-date">
                      {new Date(project.created_on).toDateString()}
                    </p>
                  </div>

                  <div id="metrics-container">
                    <div id="metrics-container-single">
                      <div id="metric-icon">
                        <RiNumbersFill />
                      </div>
                      <div id="metrics-text-container">
                        <div>
                          {projectMetrics ? (
                            <p id="metric-number">
                              {projectMetrics[project._id].annotated_texts}/
                              {projectMetrics[project._id].text_count}
                            </p>
                          ) : (
                            <Spinner
                              animation="grow"
                              variant="secondary"
                              size="sm"
                            />
                          )}
                          <p id="metric-title">
                            Texts
                            <br />
                            Annotated
                          </p>
                        </div>
                      </div>
                    </div>
                    <div id="metrics-container-single">
                      <div id="metric-icon">
                        <RiNumbersFill />
                      </div>
                      <div id="metrics-text-container">
                        <div>
                          {projectMetrics ? (
                            <p id="metric-number">
                              {Math.round(
                                projectMetrics[project._id].vocab_reduction
                              )}
                              %
                            </p>
                          ) : (
                            <Spinner
                              animation="grow"
                              variant="secondary"
                              size="sm"
                            />
                          )}
                          <p id="metric-title">
                            Vocabulary
                            <br />
                            Reduction
                          </p>
                        </div>
                      </div>
                    </div>
                    <div id="metrics-container-single">
                      <div id="metric-icon">
                        <RiNumbersFill />
                      </div>
                      <div id="metrics-text-container">
                        <div>
                          {projectMetrics ? (
                            <p id="metric-number">
                              {project.metrics.starting_oov_token_count -
                                projectMetrics[project._id].oov_corrections}
                              /{project.metrics.starting_oov_token_count}
                            </p>
                          ) : (
                            <Spinner
                              animation="grow"
                              variant="secondary"
                              size="sm"
                            />
                          )}
                          <p id="metric-title">
                            OOV
                            <br />
                            Corrections
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="action-container">
                    <MdEdit
                      id="action-icon"
                      onClick={() => modalHandler(project, "annotate")}
                    />
                    <MdFileDownload
                      id="action-icon"
                      onClick={() => modalHandler(project, "downloads")}
                    />
                    <MdDelete
                      id="action-icon"
                      style={{ color: DELETE_COLOUR }}
                      onClick={() => modalHandler(project, "delete")}
                    />
                  </div>
                </div>
              </ListGroup.Item>
            </>
          );
        })}
      </ListGroup>
    </div>
  );
};
