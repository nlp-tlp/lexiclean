import React, { useContext } from "react";
import "./Landing.css";
import "../common/Footer.css";
import { AuthContext } from "../auth/authcontext";
import history from "../utils/history";
import { BiSmile } from "react-icons/bi";
import { IoSpeedometer, IoEnter, IoExpand, IoTrophy } from "react-icons/io5";
import { MdBubbleChart } from "react-icons/md";
import { IoLogoGithub, IoLogoYoutube } from "react-icons/io5";
import { Button, Navbar, Container, Row, Col } from "react-bootstrap";

import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from "react-icons/io5";

export const Landing = () => {
  const [isAuthenticated] = useContext(AuthContext);

  return (
    <>
      <Container fluid className="landing">
        <img
          className="main-bg"
          src="https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          alt="main-background"
        />
        <IoLogoGithub
          className="nav-logo"
          id="github"
          onClick={() =>
            window.open("https://github.com/nlp-tlp/lexiclean", "_blank")
          }
        />
        <IoLogoYoutube
          className="nav-logo"
          id="youtube"
          onClick={() => window.open("https://youtu.be/P7_ooKrQPDU", "_blank")}
        />
        <Row id="main">
          <Col>
            <Row id="row-title">
              <div id="title-container">
                <MdBubbleChart id="title-icon" />
                <h1>LexiClean</h1>
              </div>
            </Row>
            <Row id="row-description">
              <Col xs={12} md={8} lg={8} xl={8}>
                <h3>
                  An annotation tool for rapid multi-task annotation of noisy
                  corpora for the task of lexical normalisation
                </h3>
              </Col>
            </Row>
            <Row id="row-signup">
              <div id="button-group">
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
                {isAuthenticated ? null : (
                  <p
                    style={{
                      textAlign: "right",
                      marginRight: "0.5rem",
                    }}
                    onClick={() => history.push("/login")}
                  >
                    or <strong style={{ cursor: "pointer" }}>login</strong>
                  </p>
                )}
              </div>
            </Row>
            <Row style={{ justifyContent: "center" }}>
              <a href="#details">
                <IoArrowDownCircleOutline id="scroll-button-down" />
              </a>
            </Row>
          </Col>
        </Row>

        <Row id="details">
          <Col>
            <Row id="row-details">
              <Col xs={12} md={4} lg={4} xl={4}>
                <div id="box">
                  <IoSpeedometer id="icon" />
                  <h3>Rapid</h3>
                  <p>
                    Enable fast corpus wide multi-task annotation to reduce
                    annotation effort
                  </p>
                </div>
              </Col>
              <Col xs={12} md={4} lg={4} xl={4}>
                <div id="box">
                  <IoExpand id="icon" />
                  <h3>Flexible</h3>
                  <p>
                    Supports token normalisation formats 1:1 and 1:N directly,
                    and N:1 indirectly
                  </p>
                </div>
              </Col>
            </Row>
            <Row id="row-details">
              <Col xs={12} md={4} lg={4} xl={4}>
                <div id="box">
                  <BiSmile id="icon" />
                  <h3>Intuitive</h3>
                  <p>
                    Maintains a simple and easy-to-use interface for improved
                    consistency
                  </p>
                </div>
              </Col>
              <Col xs={12} md={4} lg={4} xl={4}>
                <div id="box">
                  <IoTrophy id="icon" />
                  <h3>Dynamic</h3>
                  <p>Permits organic schema development during annotation</p>
                </div>
              </Col>
            </Row>
            <Row style={{ justifyContent: "right" }}>
              <a href="#main">
                <IoArrowUpCircleOutline id="scroll-button-up" />
              </a>
            </Row>
            <Row>
              <Navbar
                className="footer"
                style={{
                  width: "100%",
                  position: "absolute",
                  bottom: "0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p>© UWA NLP-TLP Group 2021.</p>
                <p style={{ fontSize: "0.75rem" }}>
                  Developer: Tyler Bikaun (
                  <a
                    href="https://github.com/4theKnowledge"
                    target="_blank"
                    rel="noreferrer"
                    alt="github repository"
                    style={{
                      color: "#263238",
                      fontWeight: "bold",
                    }}
                  >
                    4theKnowledge
                  </a>
                  )
                </p>
              </Navbar>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};
