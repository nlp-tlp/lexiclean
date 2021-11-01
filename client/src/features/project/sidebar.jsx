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
  selectProjectMetricsStatus,
} from "./projectSlice";
import { setPage } from "./textSlice";
import { setIdle } from "./tokenSlice";

import { SaveIconBtn } from "../project/savebutton";

export const Sidebar = () => {
  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const metricStatus = useSelector(selectProjectMetricsStatus);
  const metrics = useSelector(selectProjectMetrics);
  const projectStatus = useSelector((state) => state.project.status);
  const username = useSelector(selectUsername);
  const searchTerm = useSelector(selectSearchTerm);
  const [showMetricDetail, setShowMetricDetail] = useState(false);

  useEffect(() => {
    // TOOD: make this update with side effects
    if (projectStatus === "succeeded") {
      dispatch(fetchMetrics({ projectId: project._id }));
    }
  }, [projectStatus, dispatch]);

  const resetFilters = () => {
    dispatch(setSearchTerm(""));
    dispatch(setIdle());
  };

  const applyFilters = () => {
    // Apply filter and take user to first page
    dispatch(setPage(1));
    history.push(`/project/${project._id}/page/1`);
    dispatch(setIdle());
  };

  return (
    <>
      <Row>
        <Col
          style={{
            minHeight: "20vh",
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
          <Row
            style={{
              textAlign: "right",
              marginTop: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <Col>
              <Button
                style={{ margin: "0.25rem" }}
                id="button"
                size="sm"
                variant="secondary"
                disabled={searchTerm === ""}
                onClick={() => resetFilters()}
              >
                Reset
              </Button>
              <Button
                style={{ margin: "0.25rem" }}
                id="button"
                size="sm"
                variant="dark"
                disabled={searchTerm === ""}
                onClick={() => applyFilters()}
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
      </InputGroup>
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
            title="Click to return to the project feed"
            onClick={() => history.push("/feed")}
          />
          <FaInfoCircle
            id="icon"
            title="Click to view the quick reference guide"
            onClick={() => dispatch(setActiveModal("help"))}
          />
          <BsGearFill
            id="icon"
            title="Click to view project settings"
            onClick={() => dispatch(setActiveModal("settings"))}
          />
          <FaDownload
            id="icon"
            title="Click to view project downloads"
            onClick={() => dispatch(setActiveModal("downloads"))}
          />

          <FaEdit
            id="icon"
            title="Click to view or modify the project schema"
            onClick={() => dispatch(setActiveModal("schema"))}
          />
          <FaGripVertical
            id="icon"
            title="Click to view project legend"
            onClick={() => dispatch(setActiveModal("legend"))}
          />
          <SaveIconBtn />
        </div>
      </div>
    </div>
  );
};
