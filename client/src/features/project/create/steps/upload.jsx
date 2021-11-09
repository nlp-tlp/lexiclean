import { useEffect, useState } from "react";
import { Card, Col, OverlayTrigger, Popover, Row } from "react-bootstrap";
import { IoAdd, IoClose, IoInformationCircleSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import "../Create.css";
import {
  addReplacement,
  deleteReplacement,
  selectActiveStep,
  selectCorpus,
  selectReplacements,
  selectSteps,
  setStepData,
  setStepValid,
} from "../createStepSlice";

const infoContent = {
  raw_text: {
    title: "Corpus",
    content:
      "Corpus of newline separated texts that will be annotated for lexical normalisation.",
    format: ".txt\nhelo wor\nhello worl\n...",
  },
  replacements: {
    title: "Replacements",
    content: "Replacements should be in the form of a 1:1 (OOV:IV) mapping.",
    format:
      '.csv\nhelo,hello\nwor,world\n...\n\n.json\n{"helo":"hello", "wor":"world", ...}',
  },
};

export const Upload = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);
  const corpus = useSelector(selectCorpus);
  const replacements = useSelector(selectReplacements);

  const readFile = (fileMeta) => {
    let reader = new FileReader();
    reader.readAsText(fileMeta);
    reader.onload = () => {
      const fileExt = fileMeta.name.split(".").slice(-1)[0];

      if (fileExt === "txt") {
        dispatch(
          setStepData({
            corpus: reader.result.split("\n").filter((line) => line !== ""),
            corpusFileName: fileMeta.name,
          })
        );
      } else if (fileExt === "json") {
        // JSON is read as a string - converts to Object
        dispatch(
          setStepData({
            replacements: JSON.parse(reader.result),
            replacementFileName: fileMeta.name,
          })
        );
      } else if (fileExt === "csv") {
        // Process CSV by splitting on \n and then splitting on commas
        // Skips empty rows
        // Rows will the be used to build
        const rowsObject = reader.result
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => ({
            [line.split(",")[0].trim()]: line.split(",")[1].trim(),
          }));

        // Combine row objects into { str2: str1} objects
        const csvData = Object.assign({}, ...rowsObject);

        dispatch(
          setStepData({
            replacements: csvData,
            replacementFileName: fileMeta.name,
          })
        );
      }
    };
    reader.onloadend = () => {
      reader = new FileReader();
    };
  };

  useEffect(() => {
    if (corpus && corpus === "") {
      // console.log("erased corpus paste bin");

      // Reset corpus and remove file meta data if user erases all contents of corpus paste bin
      dispatch(
        setStepData({
          corpus: [],
          corpusFileName: null,
        })
      );
    }
  }, [corpus]);

  useEffect(() => {
    const valid = steps[activeStep].valid;

    if (!valid && corpus.length !== 0 && corpus[0] !== "") {
      dispatch(setStepValid(true));
    }
    if (valid && (corpus.length < 1 || corpus[0] === "")) {
      dispatch(setStepValid(false));
    }
  }, [steps]);

  const infoPopover = (content, format) => {
    return (
      <Popover id="popover-info">
        <Popover.Title>Information</Popover.Title>
        <Popover.Content>
          <p>{content}</p>
          <code style={{ whiteSpace: "pre-wrap" }}>{format}</code>
        </Popover.Content>
      </Popover>
    );
  };

  const infoOverlay = (info) => {
    return (
      <OverlayTrigger
        trigger="click"
        placement="right"
        overlay={infoPopover(info.content, info.format)}
      >
        <IoInformationCircleSharp
          // id="info-label"
          style={{ marginRight: "0.25rem" }}
        />
      </OverlayTrigger>
    );
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
          Uploads
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
      <Row
        style={{
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <Col sm={12} md={8}>
          <Row>
            <Col>
              <Card style={{ height: "40vh", display: "flex" }}>
                <Card.Header id="section-subtitle">
                  <div style={{ display: "flex" }}>
                    {infoOverlay(infoContent["raw_text"])}
                    <p style={{ margin: "0", padding: "0" }}>
                      Corpus ({corpus.length})
                    </p>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <p id="upload-text-muted">
                        {steps[activeStep].data.corpusFileName
                          ? steps[activeStep].data.corpusFileName
                          : "File format (.txt)"}
                      </p>
                      <div style={{ display: "flex", justifyContent: "right" }}>
                        <label id="upload-btn">
                          <input
                            id="corpus"
                            type="file"
                            onChange={(e) => readFile(e.target.files[0])}
                          />
                          Upload File
                        </label>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <textarea
                        className="preview-container-editable"
                        placeholder="Paste or upload corpus (.txt format)"
                        onChange={(e) =>
                          dispatch(
                            setStepData({
                              corpus: e.target.value.split("\n"),
                              corpusFileName: null,
                            })
                          )
                        }
                        value={corpus && corpus.join("\n")}
                        key="corpus-input"
                        wrap="off"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col sm={12} md={4}>
          <Row>
            <Card style={{ height: "40vh" }}>
              <Card.Header id="section-subtitle">
                <div style={{ display: "flex" }}>
                  {infoOverlay(infoContent["replacements"])}
                  <p style={{ margin: "0", padding: "0" }}>
                    Replacements ({Object.keys(replacements).length})
                  </p>
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <p id="upload-text-muted">
                      {steps[activeStep].data.replacementsFileName
                        ? steps[activeStep].data.replacementsFileName
                        : "File format (.csv or .json)"}
                    </p>
                    <div style={{ display: "flex", justifyContent: "right" }}>
                      <label id="upload-btn">
                        <input
                          id="replacements"
                          type="file"
                          onChange={(e) => readFile(e.target.files[0])}
                        />
                        Upload File
                      </label>
                    </div>
                  </Col>
                </Row>
                <Replacements />
              </Card.Body>
            </Card>
          </Row>
        </Col>
      </Row>
    </>
  );
};

const Replacements = () => {
  const dispatch = useDispatch();
  const replacements = useSelector(selectReplacements);

  const [newReplacementKey, setNewReplacementKey] = useState("");
  const [newReplacementValue, setNewReplacementValue] = useState("");

  const handleNewReplacement = () => {
    dispatch(addReplacement({ [newReplacementKey]: newReplacementValue }));
    setNewReplacementKey("");
    setNewReplacementValue("");
  };

  return (
    <>
      <div
        style={{
          height: "20vh",
          overflowY: "auto",
          border: "1px solid #b0bec5",
          backgroundColor: "rgba(0, 0, 0, 0.025)",
          color: Object.keys(replacements).length === 0 && "grey",
          padding: Object.keys(replacements).length === 0 && "0.5rem",
        }}
      >
        {Object.keys(replacements).length === 0 ? (
          "Add or upload replacements"
        ) : (
          <>
            {replacements &&
              Object.keys(replacements)
                .sort()
                .map((key) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.25rem 2rem",
                        marginBottom: "0.25rem",
                        backgroundColor: "white",
                      }}
                    >
                      {key} : {replacements[key]}
                      <IoClose
                        id="remove-button"
                        onClick={() => dispatch(deleteReplacement(key))}
                      />
                    </div>
                  );
                })}
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "0.5rem",
          justifyContent: "center",
          fontSize: "0.875rem",
        }}
      >
        <strong style={{ marginRight: "0.375rem" }}>Add Pair</strong>
        <input
          type="text"
          style={{ width: "5rem", margin: "0rem 0.25rem", textAlign: "center" }}
          value={newReplacementKey}
          placeholder={"OOV Token"}
          onChange={(e) => setNewReplacementKey(e.target.value)}
        />

        <strong>:</strong>

        <input
          type="text"
          style={{ width: "5rem", margin: "0rem 0.25rem", textAlign: "center" }}
          value={newReplacementValue}
          placeholder={"IV Token"}
          onChange={(e) => setNewReplacementValue(e.target.value)}
        />
        {newReplacementKey !== "" && newReplacementValue !== "" && (
          <IoAdd id="add-button" onClick={() => handleNewReplacement()} />
        )}
      </div>
    </>
  );
};
