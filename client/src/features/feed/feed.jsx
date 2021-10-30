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
    <Container className="feed-container">
      {/* <h1 id="title">Project Feed</h1> */}
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
    </Container>
  );
};

const ProjectList = () => {
  const DELETE_COLOUR = "#D95F69";
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects);
  const projectMetrics = useSelector(selectProjectMetrics);

  const modalHandler = (project, type) => {
    dispatch(setProject(project)); // Sets project as active...
    dispatch(setActiveModal(type));
  };

  return (
    <Container fluid className="project-list-container">
      {projects.map((project, index) => {
        return (
          <>
            <Row className="feed-item">
              <Col key={index}>
                <Row>
                  <Col
                    md={4}
                    onClick={() => modalHandler(project, "annotate")}
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
                    md={7}
                    className="justify-content-center"
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
                              OOV
                              <br />
                              Corrections
                            </p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col
                    md={1}
                    className="justify-content-right"
                    style={{ display: "flex", alignItems: "center" }}
                  >
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
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        );
      })}
    </Container>
  );
};
