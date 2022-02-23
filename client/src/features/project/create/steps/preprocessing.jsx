import { useEffect, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCorpus,
  selectPreprocessingActions,
  setStepData
} from "../createStepSlice";

export const Preprocessing = () => {
  const dispatch = useDispatch();
  const actions = useSelector(selectPreprocessingActions);
  const corpus = useSelector(selectCorpus);

  // Preprocessing
  const [previewContent, setPreviewContent] = useState(
    "Upload texts to preview"
  );
  const [corpusSize, setCorpusSize] = useState();
  const [vocabSize, setVocabSize] = useState();
  const [tokenSize, setTokenSize] = useState();

  useEffect(() => {
    // Update preview data whenever a text file is uploaded and the pre-processing
    // actions are changed

    if (corpus && Object.keys(corpus).length === 0) {
      // Reset preview content
      setPreviewContent("Upload texts to preview");
    } else {
      // Remove multiple white space and trim
      // setCorpus(
      //   Object.values(corpus).map((text) => text.replace(/\s+/g, " ").trim())
      // );
      let preCorpus = Object.values(corpus).map((text) =>
        text.replace(/\s+/g, " ").trim()
      );
      // : corpus.map((text) => text.replace(/\s+/g, " ").trim());

      if (actions.lowercase) {
        preCorpus = preCorpus.map((text) => text.toLowerCase());
      }
      if (actions.removeDuplicates) {
        preCorpus = [...new Set(preCorpus)];
      }
      if (actions.removeChars) {
        const escapedChars = [
          "[",
          "]",
          "{",
          "}",
          "(",
          ")",
          "*",
          "+",
          "?",
          "|",
          "^",
          "$",
          ".",
          "\\",
        ];
        const regexCharsEscaped = actions.removeCharSet
          .split("")
          .map((char) => (escapedChars.includes(char) ? `\\${char}` : char));
        const regex = new RegExp("[" + regexCharsEscaped + "]", "g");
        preCorpus = preCorpus.map((text) => text.replace(regex, " "));
        // Remove multiple white space and trim
        preCorpus = preCorpus.map((text) => text.replace(/\s+/g, " ").trim());
      }

      // Add data uploaded to preview content
      setPreviewContent(preCorpus.slice(0, 1000).join("\n"));

      setCorpusSize(preCorpus.length);
      setVocabSize(
        new Set(preCorpus.map((text) => text.split(" ")).flat()).size
      );
      setTokenSize(preCorpus.map((text) => text.split(" ")).flat().length);
    }
  }, [corpus, actions]);

  return (
    <Row
      style={{
        justifyContent: "center",
        backgroundColor: "white", //#f8f9fa
        minHeight: "25vh",
      }}
    >
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
            Text Preprocessing
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
        <Form.Group as={Row} style={{ margin: "0rem 0.25rem 0rem 0.25rem" }}>
          <Col sm={12} md={6}>
            <Card>
              <Card.Header id="section-subtitle">Actions</Card.Header>
              <Card.Body>
                <Form.Check
                  type="checkbox"
                  id="lowerCaseCheck"
                  label="Lower case"
                  name="lowerCaseCheck"
                  title="Removes casing from characters. This can reduce annotation effort."
                  style={{ fontSize: "14px", marginBottom: "0.5rem" }}
                  checked={actions.lowercase}
                  onChange={(e) => {
                    dispatch(setStepData({ lowercase: e.target.checked }));
                  }}
                />

                <Form.Check
                  type="checkbox"
                  id="removeCharactersCheck"
                  label="Remove characters"
                  name="removeCharactersCheck"
                  title="Removes special characters from corpus. This can reduce annotation effort."
                  style={{ fontSize: "14px", marginBottom: "0.5rem" }}
                  checked={actions.removeChars}
                  onChange={(e) => {
                    dispatch(setStepData({ removeChars: e.target.checked }));
                  }}
                />
                <Form.Control
                  type="text"
                  disabled={!actions.removeChars}
                  placeholder={actions.removeCharSet}
                  name="charsRemove"
                  value={actions.removeCharSet}
                  onChange={(e) => {
                    dispatch(setStepData({ removeCharSet: e.target.value }));
                  }}
                  autoComplete="off"
                  style={{ fontSize: "14px", marginBottom: "0.5rem" }}
                />
                <Form.Check
                  type="checkbox"
                  id="removeDuplicatesCheck"
                  label="Remove duplicates"
                  title="Removes duplicate documents from your corpus. This can reduce annotation effort."
                  name="removeDuplicatesCheck"
                  style={{ fontSize: "14px", marginBottom: "0.5rem" }}
                  checked={actions.removeDuplicates}
                  onChange={(e) => {
                    dispatch(
                      setStepData({ removeDuplicates: e.target.checked })
                    );
                  }}
                />
              </Card.Body>
            </Card>
            <Card style={{ marginTop: "1rem" }}>
              <Card.Header id="section-subtitle">Measures</Card.Header>
              <Card.Body>
                <div style={{ fontSize: "1rem" }}>
                  <p>
                    <strong>Corpus Size:</strong> {corpusSize}
                  </p>
                  <p>
                    <strong>Vocabulary Size:</strong> {vocabSize}
                  </p>
                  <p>
                    <strong>Token Count:</strong> {tokenSize}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={12} md={6}>
            <Card>
              <Card.Header id="section-subtitle">Preview</Card.Header>
              <Card.Body
                style={{
                  height: "40vh",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div className="preview-container" style={{ width: "100%" }}>
                  <pre>{previewContent}</pre>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Form.Group>
      </Col>
    </Row>
  );
};
