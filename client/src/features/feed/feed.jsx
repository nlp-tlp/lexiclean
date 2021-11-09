import React, { useEffect } from "react";
import { Button, Container, Row, Col, Spinner } from "react-bootstrap";
import { MdDelete, MdEdit, MdFileDownload } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setActiveModal, setProject } from "../project/projectSlice";
import "./Feed.css";
import {
  fetchProjectMetrics,
  fetchProjects,
  selectFeedError,
  selectFeedMetricsError,
  selectFeedMetricsStatus,
  selectFeedStatus,
  selectProjectMetrics,
  selectProjects,
  setProjectMetrics,
} from "./feedSlice";

export const Feed = () => {
  const dispatch = useDispatch();
  const feedStatus = useSelector(selectFeedStatus);
  const feedError = useSelector(selectFeedError);
  const projects = useSelector(selectProjects);

  const feedMetricsStatus = useSelector(selectFeedMetricsStatus);
  const feedMetricsError = useSelector(selectFeedMetricsError);

  useEffect(() => {
    if (feedStatus === "idle") {
      dispatch(setProjectMetrics(null)); // Remove any cached metrics before loading projects.
      dispatch(fetchProjects());
    }
    if (feedStatus === "succeeded" && feedMetricsStatus === "idle") {
      dispatch(fetchProjectMetrics());
    }
  }, [feedStatus, feedMetricsStatus, dispatch]);

  return (
    <>
      <img
        className="main-bg"
        src="https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
        alt="main-background"
      />
      <Container className="feed-container">
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
              href="/project/new"
            >
              Create Project
            </Button>
          </div>
        ) : (
          <ProjectList />
        )}
      </Container>
    </>
  );
};

const ProjectList = () => {
  const DELETE_COLOUR = "#b0bec5";
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects);
  const projectMetrics = useSelector(selectProjectMetrics);

  const modalHandler = (project, type) => {
    dispatch(setProject(project)); // Sets project as active...
    dispatch(setActiveModal(type));
  };

  return (
    <>
      <Container fluid className="project-list-container">
        {projects.map((project, index) => {
          return (
            <>
              <Row className="feed-item">
                <Col key={index}>
                  <Row>
                    <Col
                      sm={12}
                      md={12}
                      lg={4}
                      className="details-col"
                      key={index}
                    >
                      <Row>
                        <Col>
                          <h1 id="project-name">{project.name}</h1>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <p id="description">{project.description}</p>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <p id="project-creation-date">
                            {new Date(project.created_on).toDateString()}
                          </p>
                        </Col>
                      </Row>
                    </Col>

                    <Col
                      sm={12}
                      md={12}
                      lg={7}
                      className="metrics-col"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Row>
                        <Col>
                          <div id="metrics-text-container">
                            <div>
                              {projectMetrics ? (
                                <p id="metric-number">
                                  {projectMetrics[project._id].annotated_texts}/
                                  {projectMetrics[project._id].text_count}
                                </p>
                              ) : (
                                <Spinner
                                  animation="border"
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
                        </Col>
                        <Col>
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
                                  animation="border"
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
                        </Col>
                        <Col>
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
                                  animation="border"
                                  variant="secondary"
                                  size="sm"
                                />
                              )}
                              <p id="metric-title">
                                Vocabulary
                                <br />
                                Corrections
                              </p>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      sm={12}
                      md={12}
                      lg={1}
                      className="actions-col"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <div id="action-container">
                        <MdEdit
                          id="action-icon"
                          onClick={() => modalHandler(project, "annotate")}
                        />
                        {/* <MdFileDownload
                          id="action-icon"
                          onClick={() => modalHandler(project, "downloads")}
                        /> */}
                        <MdDelete
                          id="action-icon"
                          style={{ color: DELETE_COLOUR }}
                          onClick={() => modalHandler(project, "delete")}
                        />
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </>
          );
        })}
      </Container>
    </>
  );
};
