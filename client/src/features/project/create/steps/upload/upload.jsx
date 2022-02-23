import { useEffect, useState } from "react";
import { Card, Col, OverlayTrigger, Popover, Row } from "react-bootstrap";
import { IoAdd, IoClose, IoInformationCircleSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import "../../Create.css";
import {
  addReplacement,
  deleteReplacement,
  selectActiveStep,
  selectCorpus,
  selectReplacements,
  selectSteps,
  setStepData,
  setStepValid,
} from "../../createStepSlice";
import { CorpusEditor } from "./CorpusEditor";
import { ReplacementEditor } from "./ReplacementEditor";
import { readFile } from "./utils";

const infoContent = {
  raw_text: {
    title: "Corpus",
    content:
      "Corpus of newline separated texts that will be annotated for lexical normalisation.",
    format:
      "Corpus (no identifiers) (.txt)\n...\nhelo wor\nhello worl\n...\n\nCorpus (with identifiers) (.csv)\n...\nid1,helo wor\nid2,hello worl\n...",
  },
  replacements: {
    title: "Replacements",
    content: "Replacements should be in the form of a 1:1 (OOV:IV) mapping.",
    format:
      '.csv\n...\nhelo,hello\nwor,world\n...\n\n.json\n...\n{"helo":"hello", "wor":"world"}\n...',
  },
};

export const Upload = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);
  const corpus = useSelector(selectCorpus);
  const replacements = useSelector(selectReplacements);
  // const inputRef1 = useRef(null);
  // const inputRef2 = useRef(null);

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
        rootClose
      >
        <IoInformationCircleSharp
          // id="info-label"
          style={{ marginRight: "0.25rem", cursor: "pointer" }}
        />
      </OverlayTrigger>
    );
  };

  // const handleUpload = () => {
  //   inputRef1.current?.click();
  // };

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
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {infoOverlay(infoContent["raw_text"])}
                    <p style={{ margin: "0", padding: "0" }}>
                      Corpus ({Object.keys(corpus).length})
                    </p>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col
                      style={{
                        display: "flex",
                        justifyContent: "right",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "right",
                          flexDirection: "column",
                        }}
                      >
                        <label id="upload-btn">
                          <input
                            id="corpus"
                            type="file"
                            onChange={(e) =>
                              readFile(
                                dispatch,
                                e.target.files[0],
                                "corpus_no_ids"
                              )
                            }
                          />
                          Upload File (No Identifiers) (
                          {steps[activeStep].data.corpusFileName
                            ? steps[activeStep].data.corpusFileName
                            : ".txt"}
                          )
                        </label>
                        <label id="upload-btn">
                          <input
                            id="corpus"
                            type="file"
                            onChange={(e) =>
                              readFile(
                                dispatch,
                                e.target.files[0],
                                "corpus_w_ids"
                              )
                            }
                          />
                          Upload File (With Identifiers) (
                          {steps[activeStep].data.corpusFileName
                            ? steps[activeStep].data.corpusFileName
                            : ".csv"}
                          )
                        </label>
                      </div>
                      {/* <DropdownButton title="Upload File" id="upload-btn">
                        <Dropdown.Item
                          eventKey="1"
                          title="Select this option if you wish to upload documents without unique identifiers (.txt format)"
                          onClick={handleUpload}
                        >
                          <input
                            ref={inputRef1}
                            id="corpus"
                            type="file"
                            // onChange={(e) => readFile(dispatch, e.target.files[0])}
                          />
                          Plain Text (No Identifiers)
                        </Dropdown.Item>
                        <Dropdown.Item
                          eventKey="2"
                          title="Select this option if you wish to upload documents with unique identifiers (.csv format)"
                        >
                          Plain Text (With Identifers)
                        </Dropdown.Item>
                      </DropdownButton> */}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <CorpusEditor corpus={corpus} />
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
                <div style={{ display: "flex", alignItems: "center" }}>
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
                          onChange={(e) =>
                            readFile(
                              dispatch,
                              e.target.files[0],
                              "replacements"
                            )
                          }
                        />
                        Upload File
                      </label>
                    </div>
                  </Col>
                </Row>
                <ReplacementEditor />
              </Card.Body>
            </Card>
          </Row>
        </Col>
      </Row>
    </>
  );
};
