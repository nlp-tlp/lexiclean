import { Badge, Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectSteps } from "../createStepSlice";

export const Review = () => {
  const steps = useSelector(selectSteps);

  const keyToNaturalMap = {
    lowercase: "Lower Case",
    removeDuplicates: "Remove Duplicates",
    removeChars: "Remove Special Characters",
    detectDigits: "Detect Digits",
  };

  return (
    <>
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
          Review and Create
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

      <Col>
        <Row
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Col sm={12} md={4}>
            <p id="section-subtitle">Details</p>
          </Col>
          <Col sm={12} md={8}>
            <Row>
              <Badge style={{ backgroundColor: "#cfd8dc", margin: "0.125rem" }}>
                Name: {steps.details.data.name}
              </Badge>
              <Badge style={{ backgroundColor: "#cfd8dc", margin: "0.125rem" }}>
                Description: {steps.details.data.description}
              </Badge>
            </Row>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Col sm={12} md={4}>
            <p id="section-subtitle">Uploads</p>
          </Col>

          <Col sm={12} md={8}>
            <Row>
              <Badge style={{ backgroundColor: "#cfd8dc", margin: "0.125rem" }}>
                {steps.upload.data.corpus.length} Documents
              </Badge>
              <Badge style={{ backgroundColor: "#cfd8dc", margin: "0.125rem" }}>
                {Object.keys(steps.upload.data.replacements).length}{" "}
                Replacements
              </Badge>
            </Row>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Col sm={12} md={4}>
            <p id="section-subtitle">Preprocessing</p>
          </Col>

          <Col sm={12} md={8}>
            <Row>
              {Object.keys(steps.preprocessing.data).filter(
                (action) => steps.preprocessing.data[action]
              ).length === 0 ? (
                <Badge
                  style={{ backgroundColor: "#eceff1", margin: "0.125rem" }}
                >
                  No Actions Applied
                </Badge>
              ) : (
                Object.keys(steps.preprocessing.data)
                  .filter((action) => steps.preprocessing.data[action])
                  .map((action) => {
                    return (
                      <Badge
                        style={{
                          backgroundColor: "#cfd8dc",
                          margin: "0.125rem",
                        }}
                      >
                        {keyToNaturalMap[action]}
                      </Badge>
                    );
                  })
              )}
            </Row>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Col sm={12} md={4}>
            <p id="section-subtitle">Schema</p>
          </Col>

          <Col sm={12} md={8}>
            <Row>
              {Object.keys(steps.schema.data.metaTags).length === 0 ? (
                <Badge
                  style={{ backgroundColor: "#eceff1", margin: "0.125rem" }}
                >
                  No Tags Created
                </Badge>
              ) : (
                Object.keys(steps.schema.data.metaTags).map((tag) => {
                  return (
                    <Badge
                      style={{
                        backgroundColor: steps.schema.data.metaTags[tag].colour,
                        margin: "0.125rem",
                      }}
                    >
                      {tag}
                    </Badge>
                  );
                })
              )}
            </Row>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Col sm={12} md={4}>
            <p id="section-subtitle">Automatic Labelling</p>
          </Col>

          <Col sm={12} md={8}>
            <Row>
              {Object.keys(steps.labelling.data).filter(
                (action) => steps.labelling.data[action]
              ).length === 0 ? (
                <Badge
                  style={{ backgroundColor: "#eceff1", margin: "0.125rem" }}
                >
                  No Actions Applied
                </Badge>
              ) : (
                Object.keys(steps.labelling.data)
                  .filter((action) => steps.labelling.data[action])
                  .map((action) => {
                    return (
                      <Badge
                        style={{
                          backgroundColor: "#cfd8dc",
                          margin: "0.125rem",
                        }}
                      >
                        {keyToNaturalMap[action]}
                      </Badge>
                    );
                  })
              )}
            </Row>
          </Col>
        </Row>
      </Col>
    </>
  );
};
