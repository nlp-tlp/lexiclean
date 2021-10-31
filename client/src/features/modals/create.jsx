import React, { useState, useEffect } from "react";
import axios from "../utils/api-interceptor";
import history from "../utils/history";
import "./Modals.css";
import {
  Button,
  Form,
  Col,
  Row,
  Table,
  OverlayTrigger,
  Popover,
  Spinner,
} from "react-bootstrap";
import { IoBrush, IoCheckmark, IoClose } from "react-icons/io5";

import { Formik } from "formik";
import * as yup from "yup";
import { MdAddCircle, MdRemoveCircle, MdBrush } from "react-icons/md";
import { IoInformationCircleSharp } from "react-icons/io5";
import { CompactPicker } from "react-color";
import { useDispatch } from "react-redux";
import { setActiveModal } from "../../features/project/projectSlice";
import { setIdle } from "../feed/feedSlice";

// ua: "#ff5722", st: "#2196f3", en: #607d8b

const DEFAULT_COLOUR = "#607d8b";
const REPLACE_COLOUR = "#009688";
const infoContent = {
  raw_text: {
    title: "Corpus",
    content:
      "Corpus of newline separated texts that will be annotated for lexical normalisation.",
    format: ".txt\nhelo wor\nhello worl\n...",
  },
  replacements: {
    title: "Replacements",
    content: "Replacements should be in the form of a 1:1 (IV:OOV) mapping.",
    format:
      '.csv\nhelo,hello\nwor,world\n...\n\n.json\n{"helo":"hello", "wor":"world", ...}',
  },
  meta_tags: {
    title: "Meta Tags",
    content:
      "Meta tags are used to give tokens contextual classifications.\nHere meta tag classes can be specified and a gazetteer uploaded (if available in .txt file format).",
    format: ".txt\nc/o\no/h\nu/s\n",
  },
};

const DEFAULT_REMOVE_CHARS = '~",?;!:()[]_{}*.$';

const schema = yup.object().shape({
  projectName: yup.string().required(),
  projectDescription: yup.string().required(),
});

export const Create = () => {
  const dispatch = useDispatch();
  const [fileData, setFileData] = useState({
    textFile: { meta: null, data: null },
    rpFile: { meta: null, data: null },
  });
  const [dataFileLoaded, setDataFileLoaded] = useState(false);

  // States for handling metatag creation
  const [tempMetaTag, setTempMetaTag] = useState("");
  const [tempData, setTempData] = useState({ meta: null, data: null });
  const [tempColour, setTempColour] = useState(DEFAULT_COLOUR);
  const [metaTags, setMetaTags] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preprocessing
  const [previewContent, setPreviewContent] = useState(
    "Upload texts to preview"
  );
  const [corpusSize, setCorpusSize] = useState();
  const [vocabSize, setVocabSize] = useState();
  const [lowerCase, setLowerCase] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeChars, setRemoveChars] = useState(false);
  const [removeCharSet, setRemoveCharSet] = useState(DEFAULT_REMOVE_CHARS);

  const readFile = (fileKey, fileMeta) => {
    let reader = new FileReader();
    reader.readAsText(fileMeta);
    reader.onload = () => {
      const fileExtension = fileMeta.name.split(".").slice(-1)[0];

      // TODO: Check whether file is valid for the action being performed
      if (fileExtension === "txt") {
        // Split lines and remove any documents that are empty
        const newFileData = {
          meta: fileMeta,
          data: reader.result.split("\n").filter((line) => line !== ""),
        };
        setFileData((prevState) => ({ ...prevState, [fileKey]: newFileData }));
        if (fileKey === "textFile") {
          setDataFileLoaded(true);
        }

        setTempData((prevState) => ({ ...prevState, [fileKey]: newFileData })); // NEW
      } else if (fileExtension === "json") {
        // JSON is read as a string - converts to Object
        const newFileData = { meta: fileMeta, data: JSON.parse(reader.result) };
        console.log("json data", newFileData);
        setFileData((prevState) => ({ ...prevState, [fileKey]: newFileData }));
      } else if (fileExtension === "csv") {
        // Process CSV by splitting on \n and then splitting on commas
        // Skips empty rows
        // Rows will the be used to build
        // TODO: investigate if this process needs to be made async...
        const rowsObject = reader.result
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => ({
            [line.split(",")[0].trim()]: line.split(",")[1].trim(),
          }));
        // Combine row objects into { str2: str1} objects
        const csvData = Object.assign({}, ...rowsObject);
        const newFileData = { meta: fileMeta, data: csvData };
        setFileData((prevState) => ({ ...prevState, [fileKey]: newFileData }));
      }
    };
  };

  const createProject = async (values) => {
    if (fileData["textFile"].data.length > 0) {
      // Only require raw texts, users might not have any other artifacts.
      const maps = Object.keys(metaTags).map((tagKey) => ({
        type: tagKey,
        colour: metaTags[tagKey].colour,
        tokens: metaTags[tagKey].data,
        active: true,
      }));

      if (
        fileData["rpFile"] &&
        fileData["rpFile"].data &&
        Object.keys(fileData["rpFile"].data).length > 0
      ) {
        // add replacements to maps if they exist
        maps.push({
          type: "rp",
          colour: REPLACE_COLOUR,
          replacements: Object.keys(fileData["rpFile"].data).map((key) => ({
            original: key,
            normed: fileData["rpFile"].data[key],
          })),
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

      const formPayload = {
        token: window.localStorage.getItem("token"),
        name: values.projectName,
        description: values.projectDescription,
        texts: fileData["textFile"].data,
        maps: maps,
        lower_case: values.lowerCase,
        remove_duplicates: values.removeDuplicates,
        detect_digits: values.detectDigits,
        chars_remove: values.charsRemove,
      };

      // console.log("Form payload ->", formPayload);
      if (formSubmitted === false) {
        setIsSubmitting(true);
        await axios
          .post("/api/project/create", formPayload)
          .then((response) => {
            if (response.status === 200) {
              setFormSubmitted(true);
              dispatch(setActiveModal(null));
              dispatch(setIdle());
            }
          })
          .catch((error) => {
            if (error.response.status === 401 || 403) {
              console.log("unauthorized");
              history.push("/unauthorized");
            }
          });
      }
    }
  };

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
      <div style={{ display: "flex" }}>
        <p id="section-subtitle"> {info.title}</p>
        <OverlayTrigger
          trigger="click"
          placement="right"
          overlay={infoPopover(info.content, info.format)}
        >
          <IoInformationCircleSharp id="info-label" />
        </OverlayTrigger>
      </div>
    );
  };

  useEffect(() => {
    // Update preview data whenever a text file is uploaded and the pre-processing
    // actions are changed
    if (fileData["textFile"].data) {
      let corpus = fileData["textFile"].data;
      // Remove multiple white space and trim
      corpus = corpus.map((text) => text.replace(/\s+/g, " ").trim());

      if (lowerCase) {
        corpus = corpus.map((text) => text.toLowerCase());
      }
      if (removeDuplicates) {
        corpus = [...new Set(corpus)];
      }
      if (removeChars) {
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

        const regexCharsEscaped = removeCharSet
          .split("")
          .map((char) => (escapedChars.includes(char) ? `\\${char}` : char));
        const regex = new RegExp("[" + regexCharsEscaped + "]", "g");
        corpus = corpus.map((text) => text.replace(regex, " "));
        // Remove multiple white space and trim
        corpus = corpus.map((text) => text.replace(/\s+/g, " ").trim());
      }
      // Add data uploaded to preview content
      setPreviewContent(corpus.slice(0, 1000).join("\n"));

      setCorpusSize(corpus.length);
      setVocabSize(new Set(corpus.map((text) => text.split(" ")).flat()).size);
    }
  }, [fileData, lowerCase, removeDuplicates, removeChars, removeCharSet]);

  const metaTagTableProps = {
    tempColour,
    setTempColour,
    tempMetaTag,
    setTempMetaTag,
    tempData,
    setTempData,
    metaTags,
    setMetaTags,
    readFile,
  };

  return (
    <Formik
      validationSchema={schema}
      onSubmit={(values) => createProject(values)}
      initialValues={{
        projectName: "",
        projectDescription: "",
        lowerCase: false,
        removeDuplicates: false,
        removeCharacters: false,
        detectDigits: false,
        charsRemove: DEFAULT_REMOVE_CHARS,
      }}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        isValid,
        errors,
        setFieldValue,
      }) => (
        <Form className="create" noValidate onSubmit={handleSubmit}>
          <p>
            <strong>Info:</strong> Please note that when creating a project, the
            order of the texts may not be preserved due to the ranking
            methodology used when creating the project.
          </p>
          <p id="section-title">Project Details</p>
          <Row style={{ margin: "0rem 0.25rem 0rem 0.25rem" }}>
            <Col sm={4} md={4}>
              <Form.Group controlId="validationFormik01">
                <p id="section-subtitle">Name</p>
                <Form.Control
                  type="text"
                  placeholder="Enter name..."
                  name="projectName"
                  value={values.projectName}
                  onChange={handleChange}
                  autoComplete="off"
                  isValid={touched.projectName && !errors.projectName}
                  isInvalid={touched.projectName && errors.projectName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.projectName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={8} md={8}>
              <Form.Group controlId="validationFormik02">
                <p id="section-subtitle">Description</p>
                <Form.Control
                  type="text"
                  placeholder="Enter description..."
                  name="projectDescription"
                  value={values.projectDescription}
                  onChange={handleChange}
                  autoComplete="off"
                  isValid={
                    touched.projectDescription && !errors.projectDescription
                  }
                  isInvalid={
                    touched.projectDescription && errors.projectDescription
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {errors.projectDescription}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <p id="section-title">Uploads</p>
          <Row style={{ margin: "0rem 0.25rem 0rem 0.25rem" }}>
            <Col>
              {infoOverlay(infoContent["raw_text"])}
              <Form.File
                id="exampleFormControlFile1"
                onChange={(e) =>
                  setFileData((prevState) => ({
                    ...prevState,
                    textFile: {
                      meta: e.target.files[0],
                      data: readFile("textFile", e.target.files[0]),
                    },
                  }))
                }
              />
              <Form.Text id="rawtextHelpBlock" muted>
                File format (.txt)
              </Form.Text>
            </Col>
            <Col>
              {infoOverlay(infoContent["replacements"])}
              <Form.File
                id="exampleFormControlFile3"
                onChange={(e) =>
                  setFileData((prevState) => ({
                    ...prevState,
                    rpFile: {
                      meta: e.target.files[0],
                      data: readFile("rpFile", e.target.files[0]),
                    },
                  }))
                }
              />
              <Form.Text id="replacementHelpBlock" muted>
                File format (.csv or .json)
              </Form.Text>
            </Col>
          </Row>

          <p id="section-title">Text Preprocessing</p>
          <Form.Group as={Row} style={{ margin: "0rem 0.25rem 0rem 0.25rem" }}>
            <Col sm={12} md={4}>
              <p id="section-subtitle">Actions</p>
              <Form.Check
                type="checkbox"
                label="Lower case"
                name="lowerCaseCheck"
                title="Removes casing from characters. This can reduce annotation effort."
                style={{ fontSize: "14px", marginBottom: "0.5rem" }}
                checked={values.lowerCase}
                onChange={(e) => {
                  setFieldValue("lowerCase", e.target.checked);
                  setLowerCase(e.target.checked);
                }}
              />

              <Form.Check
                type="checkbox"
                label="Remove characters"
                name="removeCharactersCheck"
                title="Removes special characters from corpus. This can reduce annotation effort."
                style={{ fontSize: "14px", marginBottom: "0.5rem" }}
                checked={values.removeCharacters}
                onChange={(e) => {
                  setFieldValue("removeCharacters", e.target.checked);
                  setRemoveChars(e.target.checked);
                }}
              />
              <Form.Control
                type="text"
                disabled={!values.removeCharacters}
                placeholder={values.charsRemove}
                name="charsRemove"
                value={values.charsRemove}
                onChange={(e) => {
                  setFieldValue("charsRemove", e.target.value);
                  setRemoveCharSet(e.target.value);
                }}
                autoComplete="off"
                style={{ fontSize: "14px", marginBottom: "0.5rem" }}
              />
              <Form.Check
                type="checkbox"
                label="Remove duplicates"
                title="Removes duplicate documents from your corpus. This can reduce annotation effort."
                name="removeDuplicatesCheck"
                style={{ fontSize: "14px", marginBottom: "0.5rem" }}
                checked={values.removeDuplicates}
                onChange={(e) => {
                  setFieldValue("removeDuplicates", e.target.checked);
                  setRemoveDuplicates(e.target.checked);
                }}
              />
              {previewContent !== "Upload texts to preview" && (
                <>
                  <p id="section-subtitle">Measures</p>
                  <p>Corpus Size: {corpusSize}</p>
                  <p>Vocabulary Size: {vocabSize}</p>
                </>
              )}
            </Col>
            <Col sm={12} md={8}>
              <p id="section-subtitle">Preview</p>
              <div className="preview-container">
                <pre>{previewContent}</pre>
              </div>
            </Col>
          </Form.Group>

          <p id="section-title">Schema</p>
          <Row style={{ margin: "0rem 0.25rem 0rem 0.25rem" }}>
            <Col>
              {infoOverlay(infoContent["meta_tags"])}
              <p
                style={{
                  fontSize: "10px",
                  color: "grey",
                  marginBottom: "0.5em",
                }}
              >
                Note: Tag names must have underscores instead of white space and
                gazetteers must be in .txt file format
              </p>
              <TagContainer {...metaTagTableProps} />
            </Col>
          </Row>

          <p id="section-title">Automatic Labelling Settings</p>
          <Row style={{ margin: "0rem 0.25rem 0rem 0.25rem" }}>
            <Col md="4">
              <p id="section-subtitle">Actions</p>
              <Form.Check
                type="checkbox"
                label="Label digits as in-vocabulary"
                name="detectDigitsCheck"
                style={{ fontSize: "14px" }}
                checked={values.detectDigits}
                onChange={(e) =>
                  setFieldValue("detectDigits", e.target.checked)
                }
              />
            </Col>
          </Row>

          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              marginTop: "1em",
            }}
          >
            {isSubmitting ? (
              <Button variant="success">
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{ marginRight: "1em" }}
                />
                Creating Project...
              </Button>
            ) : (
              <Button type="submit" variant="dark">
                Create Project
              </Button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

const TagContainer = ({
  tempColour,
  setTempColour,
  tempMetaTag,
  setTempMetaTag,
  tempData,
  setTempData,
  metaTags,
  setMetaTags,
  readFile,
}) => {
  const popover = (key) => (
    <Popover id="popover-colour">
      <Popover.Title>Select Colour</Popover.Title>
      <Popover.Content>
        <CompactPicker
          color={tempColour}
          onChange={(color) => editMetaTag(key, color.hex)}
          onChangeComplete={(color) => editMetaTag(key, color.hex)}
        />
      </Popover.Content>
    </Popover>
  );

  const addMetaTag = () => {
    if (tempMetaTag !== "" && tempData) {
      if (Object.keys(tempData).includes(tempMetaTag)) {
        tempData[tempMetaTag]["colour"] = tempColour;
        setMetaTags((prevState) => ({ ...prevState, ...tempData }));
      } else {
        setMetaTags((prevState) => ({
          ...prevState,
          [tempMetaTag]: { meta: null, data: [], colour: tempColour },
        }));
      }

      // Reset states
      setTempMetaTag("");
      setTempColour(DEFAULT_COLOUR);
      document.getElementById("formControlTempMetaTag").value = null; // essentially resets form
      setTempData({ meta: null, data: null, colour: null });
    }
  };

  const removeMetaTag = (tagName) => {
    setMetaTags((prevState) =>
      Object.fromEntries(
        Object.entries(prevState).filter(([key, value]) => key !== tagName)
      )
    );
  };

  const editMetaTag = (tagName, colour) => {
    setMetaTags((prevState) => ({
      ...prevState,
      [tagName]: { ...prevState[tagName], colour: colour },
    }));
  };

  const getFontColour = (colour) => {
    // Get token contrast ratio (tests white against colour) if < 4.5 then sets font color to black
    const hexToRgb = (hex) =>
      hex
        .replace(
          /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
          (m, r, g, b) => "#" + r + r + g + g + b + b
        )
        .substring(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16));

    const luminance = (r, g, b) => {
      let a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const contrast = (rgb1, rgb2) => {
      let lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
      let lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
      let brightest = Math.max(lum1, lum2);
      let darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    };

    const ratioWhite = contrast(hexToRgb(colour), [255, 255, 255]);
    const ratioBlack = contrast(hexToRgb(colour), [0, 0, 0]);

    return ratioWhite > ratioBlack ? "white" : "black";
  };

  return (
    <>
      <Row className="schema">
        <Col>
          <Row id="input-row">
            <Col>
              <Form>
                <Form.Group>
                  <Row>
                    <Col sm={4} md={4}>
                      <Form.Control
                        type="text"
                        size="sm"
                        style={{ width: "100%" }}
                        placeholder="Enter a tag name"
                        value={tempMetaTag}
                        onChange={(e) => setTempMetaTag(e.target.value)}
                      />
                    </Col>
                    <Col
                      sm={4}
                      md={4}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Form.File
                        id="formControlTempMetaTag"
                        size="sm"
                        onChange={(e) =>
                          setTempData({
                            [tempMetaTag]: {
                              meta: e.target.files[0],
                              data: readFile(tempMetaTag, e.target.files[0]),
                            },
                          })
                        }
                      />
                    </Col>
                    <Col
                      sm={2}
                      md={2}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Form.Control
                        type="color"
                        size="sm"
                        id="exampleColorInput"
                        defaultValue={DEFAULT_COLOUR}
                        title="Choose your color"
                        style={{ width: "50px" }}
                        onChange={(e) => setTempColour(e.target.value)}
                      />
                    </Col>
                    <Col
                      sm={2}
                      md={2}
                      style={{ display: "flex", justifyContent: "right" }}
                    >
                      <Button
                        size="sm"
                        variant="dark"
                        disabled={tempMetaTag === ""}
                        onClick={() => addMetaTag()}
                      >
                        Create
                      </Button>
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Col>
          </Row>

          <Row id="preview-row">
            <Col>
              {Object.keys(metaTags).length > 0 &&
                Object.keys(metaTags).map((key) => (
                  <Row>
                    <Col sm={12} md={4}>
                      <Row>
                        <div
                          id="create-tag-preview"
                          style={{
                            backgroundColor: metaTags[key].colour,
                            color: getFontColour(metaTags[key].colour),
                          }}
                        >
                          {key[0]}
                        </div>
                        <div id="create-tag-text">{key}</div>
                      </Row>
                    </Col>
                    <Col
                      sm={12}
                      md={4}
                      style={{ padding: "0.5rem", justifyContent: "center" }}
                    >
                      {metaTags[key].meta
                        ? metaTags[key].meta.name
                        : "No data uploaded"}
                    </Col>
                    <Col sm={12} md={4}>
                      <Row
                        style={{
                          display: "flex",
                          justifyContent: "right",
                        }}
                      >
                        <OverlayTrigger
                          trigger="click"
                          placement="left"
                          overlay={popover(key)}
                        >
                          <div id="edit-button">
                            <IoBrush />
                          </div>
                        </OverlayTrigger>
                        <div id="create-tag-remove-button">
                          <IoClose onClick={() => removeMetaTag(key)} />
                        </div>
                      </Row>
                    </Col>
                  </Row>
                ))}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
