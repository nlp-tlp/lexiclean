import { useEffect } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { IoInformationCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveStep,
  selectSteps,
  setStepData,
  setStepValid,
} from "../createStepSlice";

export const Details = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);

  useEffect(() => {
    const valid = steps[activeStep].valid;
    const data = steps[activeStep].data;

    if (!valid && data.name !== "" && data.description !== "") {
      dispatch(setStepValid(true));
    }
    if (valid && (data.name === "" || data.description === "")) {
      dispatch(setStepValid(false));
    }
  }, [steps]);

  return (
    <Row>
      <Col>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            id="section-title"
            style={{
              backgroundColor: "white",
              fontSize: "1.5rem",
              textAlign: "center",
              padding: "0",
              margin: "0",
            }}
          >
            Project Details
          </p>
          <span
            style={{
              display: "block",
              borderColor: "#bdbdbd",
              borderTopStyle: "solid",
              borderTopWidth: "2px",
              width: "75px",
              margin: "auto",
              marginTop: "0.5rem",
              marginBottom: "1.5rem",
            }}
          />
        </div>
        <Row>
          <Col sm={12} md={6}>
            <Card style={{ height: "35vh" }}>
              <Card.Header id="section-subtitle">
                <IoInformationCircle /> Information
              </Card.Header>
              <Card.Body>
                The project creation process involves:
                <p style={{ padding: "0", margin: "0" }}>
                  <strong>1. Details</strong> - Enter project details
                </p>
                <p style={{ padding: "0", margin: "0" }}>
                  <strong>2. Upload:</strong> - Create or upload a corpus and
                  replacement dictionary
                </p>
                <p style={{ padding: "0", margin: "0" }}>
                  <strong>3. Preprocessing:</strong> - Apply text preprocessing
                  to your corpus
                </p>
                <p style={{ padding: "0", margin: "0" }}>
                  <strong>4. Schema:</strong> - Build a meta-tag schema for
                  multi-task annotation
                </p>
                <p style={{ padding: "0", margin: "0" }}>
                  <strong>5. Labelling:</strong> - Apply actions for automatic
                  annotation
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={12} md={6}>
            <Card style={{ height: "35vh" }}>
              <Card.Header id="section-subtitle">Details</Card.Header>
              <Card.Body>
                <Row style={{ marginBottom: "2rem" }}>
                  <Col>
                    <Form.Group>
                      <p id="section-subtitle">Name</p>
                      <Form.Control
                        type="text"
                        placeholder="Enter project name"
                        name="projectName"
                        value={steps[activeStep].data.name}
                        onChange={(e) =>
                          dispatch(setStepData({ name: e.target.value }))
                        }
                        autoComplete="off"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group>
                      <p id="section-subtitle">Description</p>
                      <Form.Control
                        type="text"
                        placeholder="Enter project description"
                        name="projectDescription"
                        value={steps[activeStep].data.description}
                        onChange={(e) =>
                          dispatch(setStepData({ description: e.target.value }))
                        }
                        autoComplete="off"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
