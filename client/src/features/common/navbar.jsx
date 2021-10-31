import React from "react";
import "./Navbar.css";
import history from "../utils/history";
import { useSelector, useDispatch } from "react-redux";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { MdBubbleChart } from "react-icons/md";
import { selectProject, setActiveModal } from "../project/projectSlice";
import { selectUsername } from "../auth/userSlice";
import { AuthButton } from "../auth/authbutton";
import {
  FaArrowAltCircleLeft,
  FaDownload,
  FaEdit,
  FaGripVertical,
  FaInfoCircle,
  FaSlidersH,
  FaUserCircle,
} from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { SaveButton } from "../project/savebutton";

export const NavBar = () => {
  const dispatch = useDispatch();
  const username = useSelector(selectUsername);
  const project = useSelector(selectProject);

  const changeNavContext = () => {
    switch (window.location.pathname.split("/")[1]) {
      case "feed":
        return "feed";
      case "project":
        return "project";
    }
  };
  const page = changeNavContext();

  if (page === "feed") {
    return (
      <Navbar
        className="navbar"
        collapseOnSelect
        expand="lg"
        variant="light"
        sticky="top"
      >
        <Container fluid>
          <Navbar.Brand href="/">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <MdBubbleChart id="brand" />
              <h3 style={{ fontWeight: "bold", color: "#263238" }}>
                Project Feed
              </h3>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto"></Nav>
            <Nav.Link onClick={() => dispatch(setActiveModal("create"))}>
              New Project
            </Nav.Link>
            <Nav.Link onClick={() => history.push("/")}>Home</Nav.Link>
            <Nav.Link>
              <AuthButton
                variant={"Logout"}
                style={{ padding: "0", margin: "0" }}
              />
            </Nav.Link>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  } else {
    return (
      <Navbar collapseOnSelect expand="lg" variant="light" sticky="top">
        <Container fluid>
          <Navbar.Brand href="/feed">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <FaArrowAltCircleLeft
                style={{
                  margin: "auto 0.5rem",
                  fontSize: "1.5rem",
                  "&:hover": { opacity: "0.5" },
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "0",
                  margin: "0",
                }}
              >
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#263238",
                    margin: "-0.5rem 0rem 0rem 0rem",
                    padding: "0",
                  }}
                >
                  {project.name}
                </p>
                <p
                  style={{
                    margin: "-0.5rem 0rem",
                    padding: "0",
                    fontSize: "0.75rem",
                    color: "#90a4ae",
                  }}
                >
                  {project.description}
                </p>
              </div>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ml-auto">
              <Nav>
                <SaveButton />
              </Nav>
              <NavDropdown title="Menu" id="collasible-nav-dropdown">
                <NavDropdown.Item
                  onClick={() => dispatch(setActiveModal("settings"))}
                >
                  <MdBubbleChart id="menu-icon" />
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => dispatch(setActiveModal("legend"))}
                >
                  <FaGripVertical id="menu-icon" />
                  Legend
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => dispatch(setActiveModal("schema"))}
                >
                  <FaEdit id="menu-icon" />
                  Schema
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => dispatch(setActiveModal("help"))}
                >
                  <FaInfoCircle id="menu-icon" />
                  Information
                </NavDropdown.Item>

                <NavDropdown.Item
                  onClick={() => dispatch(setActiveModal("downloads"))}
                >
                  <FaDownload id="menu-icon" />
                  Downloads
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item>
                  <span style={{ display: "flex" }}>
                    <IoLogOut id="menu-icon" />
                    <AuthButton
                      variant={"Logout"}
                      style={{ padding: "0", margin: "0" }}
                    />
                  </span>
                  {/* <Row
    style={{
      marginTop: "2vh",
      height: "100%",
    }}
  >
  <Col>
  <p id="avatar-icon">TB</p>
  </Col>
</Row> */}
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
};
