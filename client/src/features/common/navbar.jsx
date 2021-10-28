import React from "react";
import "./Navbar.css";
import history from "../utils/history";
import { useSelector, useDispatch } from "react-redux";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { IoLogoGithub, IoLogoYoutube } from "react-icons/io5";
import { MdBubbleChart } from "react-icons/md";
import { setActiveModal } from "../project/projectSlice";
import { selectUsername } from "./userSlice";
import { AuthButton } from "../auth/authbutton";

export const NavBar = () => {
  const dispatch = useDispatch();
  const username = useSelector(selectUsername);

  const changeNavContext = () => {
    switch (window.location.pathname.split("/")[1]) {
      case "":
        return "landing";
      case "feed":
        return "feed";
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
        <MdBubbleChart id="brand" />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          {page === "feed" && <h3 style={{ fontWeigt: "bold" }}>Feed</h3>}
        </Nav>
        <Nav>
          {page === "landing" ? (
            <>
              <Nav.Link>
                <IoLogoGithub
                  id="logo"
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
                  id="logo"
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
            <NavDropdown id="menu" title="Menu" alignRight>
              <NavDropdown.Item
                onClick={() => dispatch(setActiveModal("create"))}
              >
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
                <AuthButton id="auth-button" />
              </NavDropdown.Item>
            </NavDropdown>
          ) : null}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
