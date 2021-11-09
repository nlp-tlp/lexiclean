import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputGroup,
  Spinner,
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
import {
  IoChevronForward,
  IoChevronBack,
  IoFilterCircle,
} from "react-icons/io5";

import { BsGearFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { selectUsername } from "../auth/userSlice";
import history from "../utils/history";
import {
  fetchMetrics,
  selectProject,
  selectProjectMetrics,
  setActiveModal,
  selectProjectMetricsStatus,
  setFilter,
  selectFilter,
  resetFilter,
} from "./projectSlice";
import { setPage } from "./textSlice";
import { setIdle } from "./tokenSlice";

import { SaveIconBtn } from "../project/savebutton";
import { SaveButton } from "../project/savebutton";
import "./SaveButton.css";

export const Sidebar = () => {
  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const metricStatus = useSelector(selectProjectMetricsStatus);
  const metrics = useSelector(selectProjectMetrics);
  const projectStatus = useSelector((state) => state.project.status);
  const username = useSelector(selectUsername);
  const [showMetricDetail, setShowMetricDetail] = useState(false);

  const filter = useSelector(selectFilter);

  useEffect(() => {
    // TOOD: make this update with side effects
    if (projectStatus === "succeeded") {
      dispatch(fetchMetrics({ projectId: project._id }));
    }
  }, [projectStatus, dispatch]);

  const resetFilters = () => {
    dispatch(resetFilter());
    dispatch(setIdle());
  };

  const applyFilters = () => {
    // Apply filter and take user to first page
    console.log(filter);
    dispatch(setPage(1));
    history.push(`/project/${project._id}/page/1`);
    dispatch(setIdle());
  };

  return (
    <>
      <Row>
        <Col>
          <SaveButton />
        </Col>
      </Row>
      <Row
        style={{
          marginTop: "2rem",
        }}
      >
        <Col
          style={{
            maxHeight: "100%",
            backgroundColor: "white",
            border: "1px solid rgba(0, 0, 0, 0.125)",
            borderRadius: "0.25rem",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
          }}
        >
          <Row>
            <Col style={{ textAlign: "center", marginTop: "0.25rem" }}>
              <IoFilterCircle
                style={{ fontSize: "1.5rem", color: "#78909c" }}
              />
            </Col>
          </Row>
          <Row style={{ marginBottom: "0.5rem" }}>
            <Col>
              <TextSearch filter={filter} setFilter={setFilter} />
            </Col>
          </Row>
          <Row style={{ justifyContent: "left", marginBottom: "0.5rem" }}>
            <Col>
              <FilterAnnotated filter={filter} setFilter={setFilter} />
            </Col>
          </Row>
          {/* <Row style={{ justifyContent: "left", marginBottom: "0.5rem" }}>
            <Col>
              <FilterCandidates filter={filter} setFilter={setFilter} />
            </Col>
          </Row> */}
          <Row
            style={{
              textAlign: "right",
              marginTop: "1rem",
              paddingTop: "0.5rem",
              marginBottom: "0.5rem",
              borderTop: "1px solid #eceff1",
            }}
          >
            <Col>
              <Button
                style={{ margin: "0.25rem" }}
                id="button"
                size="sm"
                variant="secondary"
                // disabled={filter.searchTerm === ""}
                onClick={() => resetFilters()}
              >
                Reset
              </Button>
              <Button
                style={{ margin: "0.25rem" }}
                id="button"
                size="sm"
                variant="secondary"
                // disabled={filter.searchTerm === ""}
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
          marginTop: "1rem",
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
                  marginBottom: "1rem",
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
                        fontSize: "1.75rem",
                        "&:hover": {
                          fontSize: "1.5rem",
                        },
                      }}
                    >
                      {showMetricDetail ? metric.detail : metric.value}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
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
  const filter = useSelector(selectFilter);
  return (
    <InputGroup className="sidebar-textsearch">
      <InputGroup>
        <FormControl
          size="sm"
          className="input"
          placeholder="Search..."
          value={filter.searchTerm}
          onChange={(e) =>
            dispatch(setFilter({ ...filter, searchTerm: e.target.value }))
          }
        />
      </InputGroup>
    </InputGroup>
  );
};

const FilterAnnotated = () => {
  const dispatch = useDispatch();
  const filter = useSelector(selectFilter);

  return (
    <Form
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "left",
      }}
    >
      <Form.Check
        label="All"
        type="radio"
        checked={filter.annotated === "all"}
        onClick={() => dispatch(setFilter({ ...filter, annotated: "all" }))}
        name="group1"
      />
      <Form.Check
        label="Annotated"
        type="radio"
        onClick={() =>
          dispatch(setFilter({ ...filter, annotated: "annotated" }))
        }
        name="group1"
      />
      <Form.Check
        label="Unannotated"
        type="radio"
        checked={filter.annotated === "unannotated"}
        onClick={() =>
          dispatch(setFilter({ ...filter, annotated: "unannotated" }))
        }
        name="group1"
      />
    </Form>
  );
};

const FilterCandidates = () => {
  const dispatch = useDispatch();
  const filter = useSelector(selectFilter);

  return (
    <Form
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "left",
      }}
    >
      <Form.Check
        label="All"
        type="radio"
        checked={filter.candidates === "all"}
        onClick={() => dispatch(setFilter({ ...filter, candidates: "all" }))}
        name="group2"
      />
      <Form.Check
        label="Has Candidates"
        type="radio"
        onClick={() => dispatch(setFilter({ ...filter, candidates: "has" }))}
        checked={filter.candidates === "has"}
        name="group2"
      />
      <Form.Check
        label="No Candidates"
        type="radio"
        checked={filter.candidates === "none"}
        onClick={() => dispatch(setFilter({ ...filter, candidates: "none" }))}
        name="group2"
      />
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
