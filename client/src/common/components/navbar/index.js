import React, { useContext } from "react";
import history from "../../utils/history";
import { AuthContext } from "../../auth/AuthContext";
import AuthButton from "../../auth/AuthButton";

import { createUseStyles } from "react-jss";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import {
  IoLogoGithub,
  IoLogoYoutube,
  IoInformationCircleSharp,
} from "react-icons/io5";
import { MdBubbleChart } from "react-icons/md";

const useStyles = createUseStyles({
  underText: {
    fontSize: "26px",
  },
  signupButton: {
    marginTop: "1em",
    color: "black",
    fontSize: "26px",
    fontWeight: "bold",
    backgroundColor: "#f8f9fa",
    border: "2px solid black",
    padding: "0.25em 1em 0.25em 1em",
    maxWidth: "20vw",
    margin: "auto",
    "&:hover": {
      backgroundColor: "rgb(143, 143, 143)",
      borderColor: "white",
    },
    "&:active:": {
      backgroundColor: "white",
      borderColor: "white",
      color: "rgb(143, 143, 143)",
    },
  },
  details: {
    display: "flex",
    justifyContent: "space-evenly",
    marginTop: "10vh",
    maxWidth: "70vw",
    margin: "auto",
    padding: "0em 1em 0em 1em",
  },
  detailBox: {
    display: "flex",
    flexDirection: "row",
    padding: "0.5em",
    flex: "1 1 0",
  },
  detailText: {
    display: "flex",
    flexDirection: "column",
  },
  detailIcon: {
    fontSize: "48px",
    margin: "auto",
  },
  githubLogo: {
    fontSize: "22px",
    marginRight: "1em",
  },
  youtubeLogo: {
    fontSize: "22px",
    marginRight: "1em",
  },
});

export default function NavBar({
  username,
  setShowUpload,
  project,
  setShowLegend,
  setShowDownload,
  setShowModifySchema,
  setShowSettings,
  setShowHelp,
}) {
  const classes = useStyles();
  const [isAuthenticated] = useContext(AuthContext);

  const changeNavContext = () => {
    switch (window.location.pathname.split("/")[1]) {
      case "":
        return "landing";
      case "feed":
        return "feed";
      case "project":
        return "project";
      default:
        return "landing";
    }
  };
  const page = changeNavContext();

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      bg="light"
      variant="light"
      sticky="top"
    >
      <Navbar.Brand href="/">
        {page === "feed" || "project" ? (
          <MdBubbleChart style={{ fontSize: "40px" }} />
        ) : null}
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav
          className="mr-auto"
          style={{
            fontSize: page === "project" && "28px",
            fontWeight: page === "project" && "bold",
          }}
        >
          {page === "feed"
            ? `Welcome, ${username}!`
            : page === "project"
            ? `${project.name}`
            : null}
        </Nav>
        <Nav>
          {page === "landing" ? (
            <>
              <Nav.Link>
                <IoLogoGithub
                  className={classes.githubLogo}
                  onClick={() =>
                    window.open(
                      "https://github.com/nlp-tlp/lexiclean",
                      "_blank"
                    )
                  }
                />
              </Nav.Link>
              <Nav.Link>
                <IoLogoYoutube
                  className={classes.youtubeLogo}
                  onClick={() =>
                    window.open("https://youtu.be/P7_ooKrQPDU", "_blank")
                  }
                />
              </Nav.Link>
              <Nav.Link>
                <AuthButton />
              </Nav.Link>
            </>
          ) : page === "feed" ? (
            <NavDropdown title="Menu" alignRight style={{ zIndex: "100000" }}>
              <NavDropdown.Item onClick={() => setShowUpload(true)}>
                New Project
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => history.push("/")}>
                Home
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item disabled>
                Signed in as: {username}
              </NavDropdown.Item>
              <NavDropdown.Item>
                <AuthButton style={{margin: '0em', padding:'0em'}}/>
              </NavDropdown.Item>
            </NavDropdown>
          ) : page === "project" ? (
            <>
              <NavDropdown title="Menu" alignRight style={{ zIndex: "100000" }}>
                <NavDropdown.Item onClick={() => setShowLegend(true)}>
                  Legend
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowDownload(true)}>
                  Download Results
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowModifySchema(true)}>
                  Modify Schema
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowSettings(true)}>
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => history.push("/feed")}>
                  Return To Feed
                </NavDropdown.Item>
                <NavDropdown.Item disabled>
                  Signed in as: {username}
                </NavDropdown.Item>
              </NavDropdown>
              <IoInformationCircleSharp
                style={{ margin: "auto", fontSize: "1.5em" }}
                onClick={() => setShowHelp(true)}
              />
            </>
          ) : null}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
