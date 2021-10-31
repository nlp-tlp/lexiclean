import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  ButtonGroup,
  InputGroup,
  Nav,
  Spinner,
  Container,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaArrowAltCircleLeft,
  FaDownload,
  FaEdit,
  FaGripVertical,
  FaInfoCircle,
  FaSlidersH,
  FaUserCircle,
} from "react-icons/fa";
import { ImSearch } from "react-icons/im";

import { IoChevronForward, IoChevronBack } from "react-icons/io5";

import { BsGearFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { selectUsername } from "../auth/userSlice";
import history from "../utils/history";
import {
  fetchMetrics,
  selectProject,
  selectProjectMetrics,
  selectSearchTerm,
  setActiveModal,
  setSearchTerm,
} from "./projectSlice";
import { setPage } from "./textSlice";
import { setIdle } from "./tokenSlice";

export const SidebarExp = () => {
  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const metrics = useSelector(selectProjectMetrics);
  const projectStatus = useSelector((state) => state.project.status);
  const username = useSelector(selectUsername);

  const [showMetricDetail, setShowMetricDetail] = useState(false);

  useEffect(() => {
    // TOOD: make this update with side effects
    if (projectStatus === "succeeded") {
      dispatch(fetchMetrics({ projectId: project._id }));
    }
  }, [projectStatus, dispatch]);

  return (
    <>
      <Row>
        <Col
          style={{
            height: "20vh",
            backgroundColor: "white",
            border: "1px solid rgba(0, 0, 0, 0.125)",
            borderRadius: "0.25rem",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
          }}
        >
          <Row style={{ marginBottom: "0.5rem" }}>
            <Col>
              <TextSearch />
            </Col>
          </Row>
          <Row style={{ justifyContent: "left", marginBottom: "0.5rem" }}>
            <Col>
              <FilterAnnotated />
            </Col>
          </Row>
          <Row style={{ textAlign: "right", marginTop: "1rem" }}>
            <Col>
              <Button
                style={{ margin: "0.25rem" }}
                id="button"
                size="sm"
                variant="secondary"
                disabled
              >
                Reset
              </Button>
              <Button
                style={{ margin: "0.25rem" }}
                id="button"
                size="sm"
                variant="dark"
              >
                Apply
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row
        style={{
          marginTop: "2rem",
        }}
      >
        <Col>
          {metrics ? (
            metrics.map((metric) => (
              <Row
                style={{
                  backgroundColor: "white",
                  border: "1px solid rgba(0, 0, 0, 0.125)",
                  borderRadius: "0.25rem",
                  textAlign: "center",
                  marginBottom: "2rem",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                }}
              >
                <Col>
                  <div
                    className="metric"
                    style={{
                      padding: "0.5rem",
                    }}
                    onMouseEnter={() => setShowMetricDetail(true)}
                    onMouseLeave={() => setShowMetricDetail(false)}
                    title={metric.title}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "2rem",
                      }}
                    >
                      {showMetricDetail ? metric.detail : metric.value}
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                      }}
                    >
                      {metric.description}
                    </div>
                  </div>
                </Col>
              </Row>
            ))
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Spinner
                animation="grow"
                size="sm"
                style={{ margin: "0rem 1rem 0rem 1rem" }}
              />
              <Spinner
                animation="grow"
                size="sm"
                style={{ margin: "0rem 1rem 0rem 1rem" }}
              />
              <Spinner
                animation="grow"
                size="sm"
                style={{ margin: "0rem 1rem 0rem 1rem" }}
              />
            </div>
          )}
        </Col>
      </Row>
    </>
  );
};

const TextSearch = () => {
  const dispatch = useDispatch();
  const searchTerm = useSelector(selectSearchTerm);
  const project = useSelector(selectProject);

  return (
    <InputGroup className="sidebar-textsearch">
      <InputGroup>
        <FormControl
          size="sm"
          className="input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        />
        {/* <InputGroup.Text>
          <ImSearch />
        </InputGroup.Text> */}
      </InputGroup>
      {/* <InputGroup.Append>
        <Button
          size="sm"
          variant="secondary"
          disabled={searchTerm === ""}
          onClick={() => {
            // Take user back to first page if searching.
            dispatch(setPage(1));
            history.push(`/project/${project._id}/page/1`);
            dispatch(setIdle());
          }}
        >
          Search
        </Button>
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={() => {
            dispatch(setSearchTerm(""));
            dispatch(setIdle());
          }}
        >
          Reset
        </Button>
      </InputGroup.Append> */}
    </InputGroup>
  );
};

const FilterAnnotated = () => {
  return (
    <Form
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "left",
      }}
    >
      <Form.Check label="All" type="radio" name="group1" />
      <Form.Check label="Annotated" type="radio" name="group1" />
      <Form.Check label="Unannotated" type="radio" name="group1" />
    </Form>
  );
};

export const SidebarMin = () => {
  const dispatch = useDispatch();

  return (
    <div className="sidebar-min">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
        }}
      >
        <div id="sidebar-tray">
          <IoChevronForward id="icon" />
          <FaArrowAltCircleLeft
            id="icon"
            onClick={() => history.push("/feed")}
          />
          <FaInfoCircle
            id="icon"
            onClick={() => dispatch(setActiveModal("help"))}
          />
          <BsGearFill
            id="icon"
            onClick={() => dispatch(setActiveModal("settings"))}
          />
          <FaDownload
            id="icon"
            onClick={() => dispatch(setActiveModal("downloads"))}
          />

          <FaEdit
            id="icon"
            onClick={() => dispatch(setActiveModal("schema"))}
          />
          <FaGripVertical
            id="icon"
            onClick={() => dispatch(setActiveModal("legend"))}
          />
        </div>
      </div>
    </div>
  );
};
