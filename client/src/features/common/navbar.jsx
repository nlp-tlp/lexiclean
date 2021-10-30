import React from "react";
import "./Navbar.css";
import history from "../utils/history";
import { useSelector, useDispatch } from "react-redux";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { MdBubbleChart } from "react-icons/md";
import { setActiveModal } from "../project/projectSlice";
import { selectUsername } from "../auth/userSlice";
import { AuthButton } from "../auth/authbutton";

export const NavBar = () => {
  const dispatch = useDispatch();
  const username = useSelector(selectUsername);

  return (
    <Navbar
      className="navbar"
      collapseOnSelect
      expand="lg"
      variant="light"
      sticky="top"
    >
      <Navbar.Brand href="/">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <MdBubbleChart id="brand" />
          <h3 style={{ fontWeight: "bold", color: "#263238" }}>Project Feed</h3>
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
          <AuthButton variant={"Logout"} style={{ padding: "0", margin: "0" }} />
        </Nav.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};
