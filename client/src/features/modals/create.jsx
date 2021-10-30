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
          <Form.Row>
            <Form.Group as={Col} md="4" controlId="validationFormik01">
              <p id="section-subtitle">Name</p>
              <Form.Control
                type="text"
                placeholder="Enter Name"
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
            <Form.Group as={Col} md="8" controlId="validationFormik02">
              <p id="section-subtitle">Description</p>
              <Form.Control
                type="text"
                placeholder="Enter Description"
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
          </Form.Row>

          <p id="section-title">Uploads</p>
          <Form.Group as={Row}>
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
          </Form.Group>

          <p id="section-title">Text Preprocessing</p>
          <Form.Group as={Row}>
            <Col md="4">
              <p id="section-subtitle">Actions</p>
              <Form.Check
                type="checkbox"
                label="Lower case"
                name="lowerCaseCheck"
                title="Removes casing from characters. This can reduce annotation effort."
                style={{ fontSize: "14px" }}
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
                style={{ fontSize: "14px" }}
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
                style={{ fontSize: "14px" }}
              />
              <Form.Check
                type="checkbox"
                label="Remove duplicates"
                title="Removes duplicate documents from your corpus. This can reduce annotation effort."
                name="removeDuplicatesCheck"
                style={{ fontSize: "14px" }}
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
            <Col md="8">
              <p id="section-subtitle">Preview</p>
              <div className="preview-container">
                <pre>{previewContent}</pre>
              </div>
            </Col>
          </Form.Group>

          <p id="section-title">Schema</p>
          <Form.Group>
            {infoOverlay(infoContent["meta_tags"])}
            <MetaTagTable {...metaTagTableProps} />
          </Form.Group>

          <p id="section-title">Automatic Labelling Settings</p>
          <Form.Group as={Row}>
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
          </Form.Group>

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

const MetaTagTable = ({
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
  const popover = (
    <Popover id="popover-colour">
      <Popover.Title>Select Colour</Popover.Title>
      <Popover.Content>
        <CompactPicker
          color={tempColour}
          onChange={(color) => setTempColour(color.hex)}
          onChangeComplete={(color) => setTempColour(color.hex)}
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

  return (
    <>
      <Table
        striped
        bordered
        hover
        size="sm"
        style={{ fontSize: "14px", marginBottom: "0em" }}
      >
        <thead style={{ textAlign: "center" }}>
          <tr>
            <th>Tag Name</th>
            <th>Gazetteer</th>
            <th>Colour</th>
            <th>Add</th>
          </tr>
        </thead>
        <tbody
          style={{
            textAlign: "center",
            height: "5vh",
            overflow: "auto",
          }}
        >
          <tr>
            <td>
              <input
                type="text"
                style={{ width: "8em" }}
                value={tempMetaTag}
                onChange={(e) => setTempMetaTag(e.target.value)}
              />
            </td>
            <td>
              <Form.File
                id="formControlTempMetaTag"
                onChange={(e) =>
                  setTempData({
                    [tempMetaTag]: {
                      meta: e.target.files[0],
                      data: readFile(tempMetaTag, e.target.files[0]),
                    },
                  })
                }
              />
            </td>
            <td>
              <OverlayTrigger
                trigger="click"
                placement="left"
                overlay={popover}
              >
                <Button
                  style={{
                    borderColor: tempColour,
                    backgroundColor: tempColour,
                    padding: "0.2em",
                  }}
                >
                  <MdBrush />
                </Button>
              </OverlayTrigger>
            </td>
            <td>
              {tempMetaTag !== "" ? (
                <MdAddCircle
                  style={{ fontSize: "22px", color: "#28a745" }}
                  onClick={() => addMetaTag()}
                />
              ) : null}
            </td>
          </tr>
          {Object.keys(metaTags).length > 0
            ? Object.keys(metaTags).map((key) => (
                <tr>
                  <td>{key}</td>
                  <td>
                    {metaTags[key].meta
                      ? metaTags[key].meta.name
                      : "No data uploaded"}
                  </td>
                  <td>
                    <Button
                      style={{
                        borderColor: metaTags[key].colour,
                        backgroundColor: metaTags[key].colour,
                        padding: "0.2em",
                      }}
                    >
                      <MdBrush style={{ color: "white" }} />
                    </Button>
                  </td>
                  <td>
                    <MdRemoveCircle
                      style={{ fontSize: "22px", color: "#dc3545" }}
                      onClick={() => removeMetaTag(key)}
                    />
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </Table>
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
    </>
  );
};
