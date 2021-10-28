import React, { useContext } from "react";
import "./Landing.css";
import { AuthContext } from "../auth/authcontext";
import history from "../utils/history";
import { BiSmile } from "react-icons/bi";
import { IoSpeedometer, IoEnter, IoExpand, IoTrophy } from "react-icons/io5";
import { MdBubbleChart } from "react-icons/md";
import { Button, Navbar, Container, Row, Col } from "react-bootstrap";
const version = "v1.1.0";

export const Landing = () => {
  const [isAuthenticated] = useContext(AuthContext);

  return (
    <>
      {/* <NavBar /> */}
      <Container className="landing">
        <Row id="row-title">
          <div id="title-container">
            <MdBubbleChart id="title-icon" />
            <h1>LexiClean</h1>
            <p>{version}</p>
          </div>
        </Row>
        <Row id="row-description">
          <Col xs={8}>
            <h3>
              Lexiclean is an annotation tool developed for rapid multi-task
              annotation of noisy corpora for the task of lexical normalisation
            </h3>
          </Col>
        </Row>

        <Row id="row-signup">
          <Col>
            <Button
              id="signup-button"
              onClick={
                isAuthenticated
                  ? () => history.push("/feed")
                  : () => history.push("/signup")
              }
            >
              {isAuthenticated ? (
                <div>
                  Enter <IoEnter />
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>
          </Col>
        </Row>

        <Row id="row-details">
          <Col xs={4}>
            <div id="box">
              <div id="text">
                <IoSpeedometer id="icon" />
                <h3>Rapid</h3>
                <p>
                  Enable fast corpus wide multi-task annotation to reduce
                  annotation effort
                </p>
              </div>
            </div>
          </Col>
          <Col xs={4}>
            <div id="box">
              <div id="text">
                <IoExpand id="icon" />
                <h3>Flexible</h3>
                <p>
                  Supports token normalisation formats 1:1 and 1:N directly, and
                  N:1 indirectly
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <Row id="row-details">
          <Col xs={4}>
            <div id="box">
              <div id="text">
                <BiSmile id="icon" />
                <h3>Intuitive</h3>
                <p>
                  Maintains a simple and easy-to-use interface for improved
                  consistency
                </p>
              </div>
            </div>
          </Col>
          <Col xs={4}>
            <div id="box">
              <div id="text">
                <IoTrophy id="icon" />
                <h3>Dynamic</h3>
                <p>Permits organic schema development during annotation</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Navbar bg="light" fixed="bottom">
        <Navbar.Text className="m-auto">© UWA NLP-TLP Group 2021.</Navbar.Text>
      </Navbar>
    </>
  );
};
