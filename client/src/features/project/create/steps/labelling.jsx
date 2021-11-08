import { Card, Col, Form, Row } from "react-bootstrap";
import { IoInformationCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { selectLabellingActions, setStepData } from "../createStepSlice";

export const Labelling = () => {
  const dispatch = useDispatch();
  const actions = useSelector(selectLabellingActions);

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
          Automatic Labelling Settings
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
      <Row style={{ margin: "0rem 0.25rem 0rem 0.25rem" }}>
        <Col sm={12} md={6}>
          <Card style={{ height: "30vh" }}>
            <Card.Header id="section-subtitle">
              <IoInformationCircle /> Information
            </Card.Header>
            <Card.Body>
              When LexiClean processes your corpora, it uses an inverse tf-idf
              of masked out-of-vocabulary tokens to identify documents that will
              give biggest 'bang-for-buck' normalisations. Additionally,
              additional automatic labelling functions can be applied as seen on
              the right.
              <p style={{ marginTop: "0.5rem" }}>
                <strong>Label digits as in-vocabulary:</strong> Considers digits
                (1, 22, 388, etc) as in-vocabulary.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={6}>
          <Card style={{ height: "30vh" }}>
            <Card.Header id="section-subtitle">Actions</Card.Header>
            <Card.Body>
              <Form.Check
                type="checkbox"
                label="Label digits as in-vocabulary"
                title="Labels digits as in-vocabulary. Examples such as 001 and 21/2 will be excluded from automatic OOV classification"
                name="detectDigitsCheck"
                style={{ fontSize: "14px" }}
                checked={actions.detectDigits}
                onChange={(e) =>
                  dispatch(setStepData({ detectDigits: e.target.checked }))
                }
              />
              {/* <Form.Check
                type="checkbox"
                label="Exclude tokens as out-of-vocabulary"
                name="detectSpecialTokensCheck"
                style={{ fontSize: "14px" }}
                disabled
                // checked={values.detectDigits}
                // onChange={(e) =>
                //   setFieldValue("detectDigits", e.target.checked)
                // }
              /> */}
              {/* <Form.Control
                type="text"
                disabled={true}
                // {!values.removeCharacters}
                placeholder={""}
                // name="charsRemove"
                // value={values.charsRemove}
                // onChange={(e) => {
                //   setFieldValue("charsRemove", e.target.value);
                //   setRemoveCharSet(e.target.value);
                // }}
                autoComplete="off"
                style={{ fontSize: "14px", marginBottom: "0.5rem" }}
              /> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
