import { useState } from "react";
import { Badge, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { IoArrowBack, IoCheckmark } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../utils/api-interceptor";
import history from "../../utils/history";
import {
  decrementActiveStep,
  incrementActiveStep,
  saveStep,
  selectActiveStep,
  selectSteps,
  setActiveStep,
} from "./createStepSlice";
import { Details } from "./steps/details";
import { Labelling } from "./steps/labelling";
import { Preprocessing } from "./steps/preprocessing";
import { Review } from "./steps/review";
import { Schema } from "./steps/schema";
import { Upload } from "./steps/upload";

const REPLACE_COLOUR = "#009688";

export const Create = () => {
  const components = {
    details: <Details />,
    upload: <Upload />,
    preprocessing: <Preprocessing />,
    schema: <Schema />,
    labelling: <Labelling />,
    review: <Review />,
  };

  const activeStep = useSelector(selectActiveStep);

  return (
    <>
      <img
        className="main-bg"
        src="https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
        alt="main-background"
      />
      <Container fluid className="create">
        <Col id="create-col">
          <Row>
            <Col sm={12}>
              <Stepper />
            </Col>
          </Row>

          {components[activeStep]}

          <Row id="stepper-control-row">
            <Col
              sm={12}
              md={12}
              style={{ display: "flex", justifyContent: "right" }}
            >
              <StepperControls />
            </Col>
          </Row>
        </Col>
      </Container>
    </>
  );
};

const Stepper = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);

  const handleBadge = (stepName) => {
    //   Allows user to jump between steps on click; if saved or active.
    if (steps[stepName].saved || activeStep === stepName) {
      // console.log(stepName);
      dispatch(setActiveStep(stepName));
    }
  };

  return (
    <div className="multi-stepper">
      {Object.keys(steps).map((stepName, index) => {
        const step = steps[stepName];
        return (
          <>
            <div
              id="step"
              style={{
                display: "block",
                margin: "0.5rem",
                fontWeight: activeStep === stepName && "bold",
                cursor: (step.saved || activeStep === stepName) && "pointer",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center" }}
                onClick={() => handleBadge(stepName)}
              >
                <Badge
                  pill
                  style={{
                    fontSize: "0.85rem",
                    color: step.saved
                      ? "white"
                      : activeStep === stepName
                      ? "black"
                      : "#90a4ae",
                    backgroundColor: step.saved ? "#4caf50" : "#cfd8dc",
                  }}
                >
                  {step.saved ? <IoCheckmark /> : index + 1}
                </Badge>
                <span
                  style={{
                    marginLeft: "0.5rem",
                    color:
                      step.saved || activeStep === stepName
                        ? "black"
                        : "#cfd8dc",
                  }}
                >
                  <span>{stepName}</span>
                </span>
              </span>
            </div>
            {index !== Object.keys(steps).length - 1 && (
              <div>
                <span className="stepper-spacer" />
              </div>
            )}
          </>
        );
      })}
    </div>
  );
};

const StepperControls = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);

  const handleContinue = () => {
    dispatch(saveStep());
    dispatch(incrementActiveStep());
  };

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    // Create meta tag resource maps for automatic labelling
    let maps = Object.keys(steps.schema.data.metaTags).map((name) => ({
      type: name,
      colour: steps.schema.data.metaTags[name].colour,
      tokens: steps.schema.data.metaTags[name].data,
      active: true,
    }));

    // Create replacement resource map (if it was created)
    if (Object.keys(steps.upload.data.replacements).length > 0) {
      // Add existing
      maps.push({
        type: "rp",
        colour: REPLACE_COLOUR,
        replacements: Object.keys(steps.upload.data.replacements).map(
          (key) => ({
            original: key,
            normed: steps.upload.data.replacements[key],
          })
        ),
        active: true,
      });
    } else {
      maps.push({
        type: "rp",
        colour: REPLACE_COLOUR,
        replacements: {},
        active: true,
      });
    }

    // Create project payload
    const payload = {
      token: window.localStorage.getItem("token"),
      name: steps.details.data.name,
      description: steps.details.data.description,
      texts: steps.upload.data.corpus,
      maps: maps,
      lower_case: steps.preprocessing.data.lowercase,
      remove_duplicates: steps.preprocessing.data.removeDuplicates,
      chars_remove: steps.preprocessing.data.removeChars,
      charset_remove: steps.preprocessing.data.removeCharSet,
      detect_digits: steps.labelling.data.detectDigits,
    };

    // console.log("Form payload ->", payload);
    if (formSubmitted === false) {
      setIsSubmitting(true);
      await axios
        .post("/api/project/create", payload)
        .then((response) => {
          if (response.status === 200) {
            setFormSubmitted(true);
            history.push("/feed");
          }
        })
        .catch((error) => {
          if (error.response.status === 401 || 403) {
            // console.log("unauthorized");
            history.push("/unauthorized");
          }
        });
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* <Button
        size="sm"
        variant="warning"
        onClick={() => dispatch(resetSteps())}
      >
        Reset All
      </Button> */}
      {activeStep !== Object.keys(steps)[0] && (
        <Button
          style={{ marginRight: "0.5rem" }}
          size="sm"
          variant="secondary"
          onClick={() => dispatch(decrementActiveStep())}
        >
          <IoArrowBack />
        </Button>
      )}

      {activeStep === Object.keys(steps).at(-1) ? (
        <Button
          size="sm"
          variant="success"
          onClick={() => handleCreate()}
          disabled={formSubmitted}
        >
          {isSubmitting ? "Creating" : "Create"}
          {isSubmitting && (
            <Spinner
              animation="border"
              size="sm"
              style={{ marginLeft: "0.5rem" }}
            />
          )}
        </Button>
      ) : (
        <Button
          size="sm"
          variant={steps[activeStep].valid ? "success" : "secondary"}
          onClick={() => handleContinue()}
          disabled={!steps[activeStep].valid}
        >
          Save and Continue
        </Button>
      )}
    </div>
  );
};
