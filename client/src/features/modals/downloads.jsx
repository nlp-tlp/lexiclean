import React, { useState, useEffect } from "react";
import axios from "../utils/api-interceptor";
import { Form, Tab, Row, Col, ListGroup, Button } from "react-bootstrap";
import { MdFileDownload, MdLibraryBooks } from "react-icons/md";
import "./Modals.css";

import { useSelector } from "react-redux";
import { selectProjectSchema } from "../../features/project/projectSlice";

const DEFAULT_MAPS = ["ua", "st", "en"];
const DEFAULT_MAPS_EN = ["ua", "st", "rp"];

export const Downloads = ({ projectId, projectName }) => {
  const schema = useSelector(selectProjectSchema);
  const [resultType, setResultType] = useState("seq2seq");
  const [previewContent, setPreviewContent] = useState("");
  const [annotated, setAnnotated] = useState(false);
  const [resultCount, setResultCount] = useState();

  const [downloadSchema, setDownloadSchema] = useState([]);

  const downloadResults = async (project) => {
    // Fetch results
    const resultRes = await axios.post("/api/project/download/result", {
      project_id: projectId,
      type: resultType,
      annotated: annotated,
    });
    if (resultRes.status === 200) {
      // Prepare for file download
      const fileName = `${projectName}_${resultType}_results`;
      const json = JSON.stringify(resultRes.data.results, null, 4);
      const blob = new Blob([json], { type: "application/json" });
      const href = await URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName + ".json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewResults = async () => {
    const response = await axios.post("/api/project/download/result", {
      project_id: projectId,
      type: resultType,
      preview: true,
      annotated: annotated,
    });
    if (response.status === 200) {
      setPreviewContent(JSON.stringify(response.data.results, null, 4));
      setResultCount(response.data.count);
    }
  };

  const downloadTokeHist = async () => {
    const response = await axios.post("/api/project/download/tokenizations", {
      project_id: projectId,
    });
    if (response.status === 200) {
      // Prepare for file download
      const fileName = `${projectName}_tokenization_hist`;
      const json = JSON.stringify(response.data, null, 4);
      const blob = new Blob([json], { type: "application/json" });
      const href = await URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName + ".json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewTokeHist = async () => {
    const response = await axios.post("/api/project/download/tokenizations", {
      project_id: projectId,
      preview: true,
    });
    if (response.status === 200) {
      setPreviewContent(JSON.stringify(response.data, null, 4));
    }
  };

  const previewMap = async (mapName) => {
    const response = await axios.post("/api/map/download", {
      project_id: projectId,
      mapName: mapName,
      preview: true,
    });
    if (response.status === 200) {
      if (mapName === "rp") {
        // Format JSON
        setPreviewContent(JSON.stringify(response.data, null, 2));
      } else {
        // Format TXT
        setPreviewContent(
          response.data.values.length > 0 && response.data.values.join("\n")
        );
      }
    }
  };

  const downloadMaps = async (mapName) => {
    const response = await axios.post("/api/map/download", {
      project_id: projectId,
      mapName: mapName,
    });

    if (response.status === 200) {
      if (mapName === "rp") {
        // Only replacements are output as JSON

        // Prepare for file download
        const fileName = `${projectName}_map_replacements`;
        const json = JSON.stringify(response.data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const href = await URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Others are output as TXT
        const fileName = `${projectName}_map_${mapName}`;
        const text = response.data.values.join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const href = await URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = fileName + ".txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const resultTypeCheckBoxes = (
    <div className="download" id="checkbox-container">
      <Form.Check
        inline
        type="checkbox"
        label="Sequence-to-Sequence"
        className="download"
        id="checkbox"
        checked={resultType === "seq2seq"}
        onChange={() => {
          setResultType("seq2seq");
          previewResults();
        }}
      />
      <Form.Check
        inline
        className="download"
        id="checkbox"
        type="checkbox"
        label="Token Classification"
        checked={resultType === "tokenclf"}
        onChange={() => {
          setResultType("tokenclf");
          previewResults();
        }}
      />
    </div>
  );

  const downloadOptionsContainer = (
    <Form.Group>
      <Row>
        <Col>
          <Form.Check
            inline
            type="checkbox"
            label="Annotated Only"
            className="download"
            id="checkbox"
            checked={annotated}
            onChange={() => {
              setAnnotated(!annotated);
              previewResults();
            }}
          />
        </Col>
        <Col>
          {/* <Form.Control
        as="select"
        multiple
        value={downloadSchema}
        onChange={(e) =>
          setDownloadSchema(
            [].slice.call(e.target.selectedOptions).map((item) => item.value)
          )
        }
      >
        {schema.map_keys
          .filter((key) => !DEFAULT_MAPS_EN.includes(key))
          .map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
      </Form.Control> */}
        </Col>
      </Row>
    </Form.Group>
  );

  const resources = {
    results: {
      normalisations: {
        title: "Normalisations",
        description:
          "Results of the normalisation project in extended W-NUT json format. Either sequence-to-sequence (seq2seq) or token classification formats can be selected. Seq2seq will remove white space between tokens and permit m:n sequence lengths, whereas token classification will remain m:m.",
        colour: "black",
        function: () => downloadResults(),
        preview: () => previewResults(),
      },
      tokenisations: {
        title: "Tokenisations",
        description:
          "Results of tokenisations performed throughout the normalisation project. Token pieces for each tokenisation event are provided in json format.",
        colour: "black",
        function: () => downloadTokeHist(),
        preview: () => previewTokeHist(),
      },
    },
    resources: schema
      ? Object.assign(
          {},
          ...schema.map_keys
            .filter((key) => !DEFAULT_MAPS.includes(key))
            .map((mapName, index) => ({
              [index]: {
                title: mapName === "rp" ? "replacements" : mapName,
                description:
                  mapName === "rp"
                    ? "Replacement dictionary resource generated throughout the project. This is downloadable in json format."
                    : "Gazetteer resource generated through the project. This is downloadable in txt format.",
                colour:
                  mapName === "rp" ? "black" : schema.contents[mapName].colour,
                function: () => downloadMaps(mapName),
                preview: () => previewMap(mapName),
              },
            }))
        )
      : {},
  };

  return (
    <div className="download">
      <p id="main-description">
        <strong>Info:</strong> Results and resources obtained through the
        project. Select any of the tabs on the right hand side to preview the
        results and resources before downloading.
      </p>

      <Tab.Container id="results-resources-group">
        <Row>
          <Col sm={5}>
            <ListGroup>
              {Object.keys(resources).map((header) => {
                return (
                  <>
                    <ListGroup.Item
                      // variant="secondary"
                      className="list-header"
                      style={{ textTransform: "capitalize" }}
                    >
                      {header}
                    </ListGroup.Item>
                    {Object.keys(resources[header]).map((item) => {
                      return (
                        <ListGroup.Item
                          action
                          className="list-item"
                          href={`#${resources[header][item].title}`}
                          style={{
                            color: resources[header][item].colour,
                            fontWeight: "bold",
                          }}
                          onClick={resources[header][item].preview}
                        >
                          {resources[header][item].title}
                        </ListGroup.Item>
                      );
                    })}
                  </>
                );
              })}
            </ListGroup>
          </Col>
          <Col sm={7}>
            <Tab.Content>
              {Object.keys(resources).map((header) => {
                return Object.keys(resources[header]).map((item) => {
                  return (
                    <Tab.Pane eventKey={`#${resources[header][item].title}`}>
                      <div style={{ display: "flex", width: "100%" }}>
                        <p style={{ fontSize: "1em", fontWeight: "bold" }}>
                          Details
                        </p>
                      </div>
                      <p>{resources[header][item].description}</p>
                      <p style={{ fontSize: "1em", fontWeight: "bold" }}>
                        Preview
                      </p>
                      {item === "normalisations" && (
                        <p>{resultTypeCheckBoxes}</p>
                      )}
                      <div
                        style={{
                          backgroundColor: "rgba(0,0,0,0.025)",
                          padding: "0.5em",
                          overflowY: "scroll",
                          maxHeight: "50vh",
                          height: "40vh",
                        }}
                      >
                        <pre>{previewContent}</pre>
                      </div>
                      {item === "normalisations" ? (
                        <>
                          <p
                            style={{
                              marginTop: "0.5em",
                              fontSize: "1em",
                              fontWeight: "bold",
                              cursor: "pointer",
                              color: "black",
                            }}
                          >
                            Download Options
                          </p>
                          {downloadOptionsContainer}
                          <Button
                            variant="dark"
                            size="sm"
                            style={{
                              marginTop: "1em",
                            }}
                            onClick={resources[header][item].function}
                          >
                            <MdFileDownload
                              style={{
                                fontSize: "22px",
                                margin: "auto",
                              }}
                            />
                            Download ({resultCount})
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="dark"
                          size="sm"
                          style={{
                            marginTop: "1em",
                          }}
                          onClick={resources[header][item].function}
                        >
                          <MdFileDownload
                            style={{
                              fontSize: "22px",
                              margin: "auto",
                            }}
                          />
                          Download
                        </Button>
                      )}
                    </Tab.Pane>
                  );
                });
              })}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
};
