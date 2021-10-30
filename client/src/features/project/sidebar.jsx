import React, { useEffect } from "react";
import {
  Button,
  FormControl,
  ButtonGroup,
  InputGroup,
  Nav,
  Spinner,
  Container,
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

export const Sidebar = () => {
  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const metrics = useSelector(selectProjectMetrics);
  const projectStatus = useSelector((state) => state.project.status);
  const username = useSelector(selectUsername);

  useEffect(() => {
    // TOOD: make this update with side effects
    if (projectStatus === "succeeded") {
      dispatch(fetchMetrics({ projectId: project._id }));
    }
  }, [projectStatus, dispatch]);

  return (
    <div className="sidebar">
      <Nav className="d-none d-md-block sidebar">
        <div className="sidebar-header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FaArrowAltCircleLeft
              id="icon"
              onClick={() => history.push("/feed")}
            />
            {/* TODO: Make dynamic! */}
            {/* {username} */}
            <p id="avatar-icon">TB</p>
          </div>

          <div>
            <h3>{project.name}</h3>
            <p id="description">{project.description}</p>
          </div>
          <p>© UWA NLP-TLP Group 2021.</p>
        </div>

        <div id="control-tray">
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
        </div>

        <div className="metrics">
          {metrics ? (
            metrics.map((metric) => (
              <div id="metric" title={metric.title}>
                <div
                  style={{
                    backgroundColor: "#607d8b",
                    marginLeft: "3rem",
                    marginRight: "3rem",
                    color: "white",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div id="value">{metric.value}</div>
                  <div id="detail">({metric.detail})</div>
                  <div id="description">{metric.description}</div>
                </div>
              </div>
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
        </div>

        <div
          style={{
            backgroundColor: "#cfd8dc",
            display: "flex",
            justifyContent: "space-evenly",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
            id="icon"
            onClick={() => dispatch(setActiveModal("schema"))}
          >
            <FaEdit />
            <p style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Schema</p>
          </div>
          <div
            style={{
              textAlign: "center",
            }}
            id="icon"
            onClick={() => dispatch(setActiveModal("legend"))}
          >
            <FaGripVertical />
            <p style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Legend</p>
          </div>
        </div>

        <div className="filters">
          <div id="filter">
            <TextSearch />
          </div>
          <div id="filter">
            <FilterAnnotated />
          </div>
          <div id="button-group">
            <Button id="button" size="sm" variant="secondary" disabled>
              Reset
            </Button>
            <Button id="button" size="sm" variant="dark">
              Apply
            </Button>
          </div>
        </div>
      </Nav>
    </div>
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

const FilterAnnotated = ({ min }) => {
  return (
    <ButtonGroup size="sm" className="mb-2">
      <Button variant="secondary">All</Button>
      <Button disabled variant="secondary">
        {min ? "A" : "Annotated"}
      </Button>
      <Button disabled variant="secondary">
        {min ? "UA" : "Unannotated"}
      </Button>
    </ButtonGroup>
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
