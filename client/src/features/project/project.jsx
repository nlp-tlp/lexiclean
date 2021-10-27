import React, { useState, useEffect } from "react";
import history from "../../common/utils/history";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import {
  Spinner,
  Container,
  Row,
  Col,
  Button,
  OverlayTrigger,
  Popover,
  Nav,
  InputGroup,
  FormControl,
  Pagination,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { MdDelete, MdBrush, MdBookmark, MdBook } from "react-icons/md";
import { BsArrowRightShort } from "react-icons/bs";
import { CgMergeVertical, CgMoreVertical } from "react-icons/cg";
import { IoInformationCircleSharp } from "react-icons/io5";
import {
  FaSlidersH,
  FaUserCircle,
  FaInfoCircle,
  FaEdit,
  FaGripVertical,
  FaDownload,
  FaArrowAltCircleLeft,
  FaSave,
} from "react-icons/fa";
import TokenizeGif from "../../common/media/tokenize.gif";
// Context Menu
import { useContextMenu, Menu, Item, Submenu, theme } from "react-contexify";
import { IoMdArrowDropright } from "react-icons/io";
import "react-contexify/dist/ReactContexify.css";

// Toast
import { Toast } from "react-bootstrap";

import "./AnnotationTable.css";
import "./Text.css";
import "./Token.css";
import "./Toast.css";
import "./Paginator.css";
import {
  setSearchTerm,
  setActiveModal,
  selectProject,
  selectSearchTerm,
  selectBgColourMap,
  selectActiveMaps,
  selectProjectMetrics,
  fetchProject,
  fetchProjectMaps,
  fetchMetrics,
} from "./projectSlice";
import {
  selectPageLimit,
  selectPage,
  selectTokenizeTextId,
  selectTotalPages,
  getTotalPages,
  setPage,
  setTokenizeTextId,
  updateAnnotationStates,
} from "./textSlice";
import {
  setIdle,
  selectTextTokenMap,
  selectTokenValues,
  applySingleTokenization,
  updateSingleTokenDetails,
  updateAllTokenDetails,
  updateCurrentValue,
  selectToastInfo,
  selectShowToast,
  setShowToast,
  // API CALLS - TEXT TOKENS
  fetchTokens,
  // API CALLS
  patchSingleReplacement,
  patchAllReplacements,
  patchSingleSuggestedReplacement,
  patchAllSuggestedReplacements,
  deleteSingleReplacement,
  deleteAllReplacements,
  deleteSingleSuggestedReplacement,
  deleteAllSuggestedReplacements,
  // API CALLS - META TAGS
  deleteSingleMetaTag,
  deleteAllMetaTags,
  patchSingleMetaTag,
  patchAllMetaTags,
} from "./tokenSlice";
import { selectUsername } from "./userSlice";
import { setActiveProject } from "./feedSlice";

export const Project = () => {
  const dispatch = useDispatch();

  const { projectId: activeProjectId } = useParams();
  let { pageNumber } = useParams();

  const project = useSelector(selectProject);
  const projectStatus = useSelector((state) => state.project.status);
  const projectError = useSelector((state) => state.project.error);
  const bgColourMap = useSelector(selectBgColourMap);
  const searchTerm = useSelector(selectSearchTerm);
  const showToast = useSelector(selectShowToast);

  const pageLimit = useSelector(selectPageLimit);
  const page = useSelector(selectPage);
  const textsError = useSelector((state) => state.texts.error);
  const tokenizeTextId = useSelector(selectTokenizeTextId);

  const tokensStatus = useSelector((state) => state.tokens.status);
  const tokensError = useSelector((state) => state.tokens.error);

  const textTokenMap = useSelector(selectTextTokenMap);

  useEffect(() => {
    // Updates texts whenever page is changed...
    dispatch(setPage(pageNumber));
    dispatch(setIdle());
  }, [pageNumber]);

  useEffect(() => {
    // Loader for project information
    if (activeProjectId && projectStatus === "idle") {
      dispatch(fetchProject({ projectId: activeProjectId }));
      dispatch(fetchProjectMaps({ projectId: activeProjectId }));
    }
  }, [activeProjectId, projectStatus, dispatch]);

  useEffect(() => {
    if (
      activeProjectId &&
      projectStatus === "succeeded" &&
      tokensStatus === "idle"
    ) {
      // Global variable that is used with modals...
      dispatch(setActiveProject(project));

      // Fetches the count of total pages based on current settings
      // and the tokens associated with the texts on the current page.
      dispatch(
        getTotalPages({
          project_id: project._id,
          get_pages: true,
          search_term: searchTerm,
          page_limit: pageLimit,
        })
      );
      dispatch(
        fetchTokens({
          project_id: project._id,
          search_term: searchTerm,
          page_limit: pageLimit,
          page: page,
        })
      );
    }
    if (tokensStatus === "succeeded") {
      dispatch(
        updateAllTokenDetails({
          token_ids: textTokenMap.map((text) => text.token_ids).flat(),
          bgColourMap: bgColourMap,
        })
      );
    }
  }, [tokensStatus, projectStatus, dispatch]);

  let textsContent;
  if (tokensStatus === "loading") {
    textsContent = <Spinner />;
  } else if (tokensStatus === "succeeded") {
    textsContent = (
      <div className="annotation-table">
        {textTokenMap &&
          textTokenMap.map((text, id) => {
            return (
              <div
                id="row"
                key={id}
                style={{
                  background: text.annotated
                    ? "rgba(153,191,156,0.2)"
                    : "#f2f2f2",
                }}
              >
                <div id="index-column">
                  <p id="icon">{id + 1 + (page - 1) * pageLimit}</p>
                </div>
                <div id="text-column">
                  {tokenizeTextId === text._id ? (
                    <Tokenize tokenIds={text.token_ids} textId={text._id} />
                  ) : (
                    <Text tokenIds={text.token_ids} textId={text._id} />
                  )}
                </div>
                <div
                  id="tokenize-icon"
                  onClick={() =>
                    dispatch(
                      setTokenizeTextId(
                        tokenizeTextId === text._id ? null : text._id
                      )
                    )
                  }
                >
                  {/* TODO: Make icon coloured if the text has been tokenized */}
                  {tokenizeTextId === text._id ? (
                    <CgMergeVertical />
                  ) : (
                    <CgMoreVertical />
                  )}
                </div>
              </div>
            );
          })}
      </div>
    );
  } else if (tokensStatus === "failed") {
    textsContent = <div>{textsError}</div>;
  }

  return (
    <>
      {showToast && <ContextToast />}
      <Container fluid>
        <Row>
          <Col id="sidebar-wrapper">
            <Sidebar />
          </Col>
          <Col id="page-content-wrapper">
            {
              // When loading documents
              tokensStatus === "loading" ? (
                <div
                  style={{
                    margin: "auto",
                    padding: "1em",
                    borderRadius: "0.5em",
                    justifyContent: "center",
                    width: "20vw",
                    maxWidth: "200px",
                    backgroundColor: "lightgray",
                    boxShadow: "inset -1px 0 0 rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    marginTop: "25vh",
                  }}
                >
                  <Spinner animation="border" style={{ marginRight: "1em" }} />

                  <p style={{ fontSize: "1.5em" }}>Loading...</p>
                </div>
              ) : (
                <>
                  <SaveButton />
                  {textsContent}
                  <Paginator />
                </>
              )
            }
          </Col>
        </Row>
      </Container>
    </>
  );
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const metrics = useSelector(selectProjectMetrics);
  const projectStatus = useSelector((state) => state.project.status);
  const username = useSelector(selectUsername);

  useEffect(() => {
    // TOOD: make this update with side effects
    if (projectStatus === "succeeded") {
      dispatch(fetchMetrics({ projectId: project._id }));
    }
  }, [projectStatus, dispatch]);

  const menuItems = [
    {
      name: "Legend",
      trigger: () => dispatch(setActiveModal("legend")),
      icon: <FaGripVertical className="icon" />,
    },
    {
      name: "Download Results",
      trigger: () => dispatch(setActiveModal("downloads")),
      icon: <FaDownload className="icon" />,
    },
    {
      name: "Modify Schema",
      trigger: () => dispatch(setActiveModal("schema")),
      icon: <FaEdit className="icon" />,
    },
    {
      name: "Settings",
      trigger: () => dispatch(setActiveModal("settings")),
      icon: <FaSlidersH className="icon" />,
    },
    {
      name: "Help",
      trigger: () => dispatch(setActiveModal("help")),
      icon: <FaInfoCircle className="icon" />,
    },
    {
      name: "Return To Feed",
      trigger: () => history.push("/feed"),
      icon: <FaArrowAltCircleLeft className="icon" />,
    },
  ];

  return (
    <div className="sidebar">
      <Nav className="d-none d-md-block sidebar">
        <div className="sidebar-header">
          <h3>{project.name}</h3>
          <p>© UWA NLP-TLP Group 2021.</p>
        </div>

        <div className="sidebar-subheader">
          <h4>Filters</h4>
          <TextSearch />
        </div>

        <div className="sidebar-subheader">
          <h4>Metrics</h4>
          {metrics ? (
            metrics.map((metric) => (
              <div className="metric" title={metric.title}>
                <p className="value">{metric.value}</p>
                <div className="detail-container">
                  <p className="detail">{metric.detail}</p>
                  <p className="description">{metric.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ margin: "auto" }}>
              <Spinner animation="border" size="sm" />
            </div>
          )}
        </div>
        <div className="sidebar-subheader">
          <h4>Menu</h4>
          {menuItems &&
            menuItems.map((item) => (
              <Nav.Item>
                <Nav.Link onClick={item.trigger}>
                  {item.icon}
                  {item.name}
                </Nav.Link>
              </Nav.Item>
            ))}
        </div>
        <div className="sidebar-subheader">
          <Nav.Link disabled>
            <FaUserCircle className="icon" />
            Signed in as: {username}
          </Nav.Link>
        </div>
      </Nav>
    </div>
  );
};

const TextSearch = () => {
  const dispatch = useDispatch();
  const searchTerm = useSelector(selectSearchTerm);
  const project = useSelector(selectProject);

  return (
    <InputGroup className="sidebar-textsearch">
      <FormControl
        className="input"
        placeholder="Enter term to filter"
        value={searchTerm}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
      />
      <InputGroup.Append>
        <Button
          variant="dark"
          disabled={searchTerm === ""}
          onClick={() => {
            // Take user back to first page if searching.
            dispatch(setPage(1));
            history.push(`/project/${project._id}/page/1`);
            dispatch(setIdle());
          }}
        >
          Search
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => {
            dispatch(setSearchTerm(""));
            dispatch(setIdle());
          }}
        >
          Reset
        </Button>
      </InputGroup.Append>
    </InputGroup>
  );
};

const Text = ({ tokenIds, textId }) => {
  return (
    <div className="text-container">
      {Object.values(tokenIds).map((tokenId) => {
        return <Token tokenId={tokenId} textId={textId} />;
      })}
    </div>
  );
};

const Tokenize = ({ tokenIds, textId }) => {
  const dispatch = useDispatch();
  const tokenValues = useSelector(selectTokenValues);
  const [tokenIndexes, setTokenIndexes] = useState(new Set());
  const [tokenIndexGroups, setTokenIndexGroups] = useState([]);
  const [valid, setValid] = useState(false);

  const handleIndex = (index) => {
    if (tokenIndexes.has(index)) {
      setTokenIndexes((prev) => new Set([...prev].filter((x) => x !== index)));
    } else {
      setTokenIndexes((prev) => new Set(prev.add(index)));
    }
  };

  useEffect(() => {
    const indexes = Array.from(tokenIndexes).sort((a, b) => {
      return a - b;
    });
    const groups = indexes.reduce((r, n) => {
      // https://stackoverflow.com/questions/47906850/javascript-group-the-numbers-from-an-array-with-series-of-consecutive-numbers
      const lastSubArray = r[r.length - 1];
      if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
        r.push([]);
      }
      r[r.length - 1].push(n);
      return r;
    }, []);
    setTokenIndexGroups(groups);
    // Check all sub arrays are greater than 1 in length
    const validSelection = groups.filter((l) => l.length === 1).length === 0;
    setValid(validSelection);
  }, [tokenIndexes]);

  const infoPopover = (
    <Popover id="tokenize-popover">
      <Popover.Title as="h3">Tokenization Help</Popover.Title>
      <Popover.Content>
        <img id="tokenization-gif" src={TokenizeGif} alt="tokenization gif" />
      </Popover.Content>
    </Popover>
  );

  return (
    <div className="tokenize-container">
      <div id="tokens">
        {tokenIds &&
          Object.values(tokenIds).map((token_id) => {
            const token = tokenValues[token_id];
            const colour = tokenIndexes.has(token.index)
              ? "#BFE3BF"
              : "#fdfd96";
            // TODO: Integrate into utlity function that is shared across components
            // 60 is MIN_TOKEN_WIDTH
            const width =
              (token.value.length + 2) * 10 < 60
                ? "60px"
                : `${(token.value.length + 2) * 10}px`;

            return (
              <div
                id="token"
                style={{
                  backgroundColor: colour,
                  width: width,
                }}
                onClick={() => handleIndex(token.index)}
              >
                {token.value}
              </div>
            );
          })}
      </div>
      <div className="action-container">
        <Button
          id="action-button"
          size="sm"
          disabled={tokenIndexes.size <= 1 || !valid}
          onClick={() => {
            dispatch(
              applySingleTokenization({
                originalTokenIds: tokenIds,
                tokenIndexes: tokenIndexes,
                tokenIndexGroups: tokenIndexGroups,
                textId: textId,
                newTokenIds: Array(tokenIndexGroups.length).fill(nanoid()),
              })
            );
            dispatch(
              setTokenizeTextId({
                tokenizeTextId: null,
              })
            );
          }}
        >
          Apply
        </Button>
        {/* <Button id="action-button" size="sm" disabled>
          Apply all
        </Button> */}
        <Button id="action-button" size="sm" disabled={tokenIndexes.size === 0}>
          Clear
        </Button>
        <OverlayTrigger trigger="click" placement="right" overlay={infoPopover}>
          <IoInformationCircleSharp id="action-info" />
        </OverlayTrigger>
      </div>
    </div>
  );
};

const Token = ({ tokenId, textId }) => {
  const tokenValues = useSelector(selectTokenValues);
  const token = tokenValues[tokenId];

  // Menu
  const MENU_ID = `menu-${textId}-${token._id}`;
  const { show: showContextMenu } = useContextMenu({ id: MENU_ID });

  return (
    <div className="token" key={token._id}>
      <TokenInput
        token={token}
        textId={textId}
        showContextMenu={showContextMenu}
      />
      <TokenUnderline token={token} textId={textId} />
      <ContextMenu menuId={MENU_ID} token={token} textId={textId} />
    </div>
  );
};

const ContextMenu = ({ menuId, token, textId }) => {
  const dispatch = useDispatch();
  const bgColourMap = useSelector(selectBgColourMap);
  const activeMaps = useSelector(selectActiveMaps);
  const project = useSelector(selectProject);

  const DEFAULT_MAPS = ["ua", "rp", "st"]; // Note: This excludes 'en'

  const applySingle = (field) => {
    dispatch(
      patchSingleMetaTag({
        tokenId: token._id,
        textId: textId,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
  };

  const applyAll = (field) => {
    dispatch(
      patchAllMetaTags({
        originalValue: token.value,
        projectId: project._id,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
  };

  const removeSingle = (field) => {
    dispatch(
      deleteSingleMetaTag({
        tokenId: token._id,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
  };

  const removeAll = (field) => {
    dispatch(
      deleteAllMetaTags({
        originalValue: token.value,
        projectId: project._id,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
  };

  return (
    <Menu id={menuId}>
      {Object.keys(bgColourMap)
        .filter(
          (key) =>
            !DEFAULT_MAPS.includes(key) && [...activeMaps, "en"].includes(key)
        )
        .map((item) => (
          <Submenu
            label={
              <div
                style={{
                  backgroundColor: token.meta_tags[item]
                    ? bgColourMap[item]
                    : null,
                  padding: "5px",
                  borderRadius: "5px",
                }}
              >
                {item}
              </div>
            }
            arrow={<IoMdArrowDropright />}
            theme={theme.light}
          >
            <Item onClick={() => applyAll(item)}>Apply all</Item>
            <Item onClick={() => applySingle(item)}>Apply one</Item>
            <Item onClick={() => removeSingle(item)}>Remove one</Item>
            <Item onClick={() => removeAll(item)}>Remove all</Item>
          </Submenu>
        ))}
    </Menu>
  );
};

const ContextToast = () => {
  const dispatch = useDispatch();
  const toastInfo = useSelector(selectToastInfo);
  const showToast = useSelector(selectShowToast);
  const toastAvailable = Object.keys(toastInfo).length > 0;

  const header = (info) => {
    return (
      <div>
        <strong className="mr-auto">
          {info.type.includes("replacement") && "Replacement"}
          {info.type.includes("meta") && "Meta Tag"}
          {info.type.includes("suggestion") && "Suggestion"}
        </strong>
        <small style={{ marginLeft: "0.25em" }}>just now</small>
      </div>
    );
  };

  const replacementView = (info) => {
    return (
      <div>
        {info.type.includes("remove")
          ? "Removed replacement from: "
          : "Original: "}
        <strong>{info.content.original}</strong> <br />
        {info.type.includes("add") && (
          <>
            Replacement: <strong>{info.content.replacement}</strong>
            <br />
          </>
        )}
        {info.type.includes("all") && (
          <>
            Count: <strong>{info.content.count}</strong>
          </>
        )}
      </div>
    );
  };

  const metaView = (info) => {
    return (
      <div>
        Token: <strong>{info.content.original}</strong> <br />
        Tag: <strong>{info.content.metaTag}</strong> <br />
        Bool: <strong>
          {info.content.metaTagValue ? "true" : "false"}
        </strong>{" "}
        <br />
        {info.type.includes("all") && (
          <>
            Count: <strong>{info.content.count}</strong>
          </>
        )}
      </div>
    );
  };

  const suggestionView = (info) => {
    return (
      <div>
        {info.type.includes("remove")
          ? "Removed suggestion from: "
          : "Original: "}{" "}
        <strong>{info.content.original}</strong> <br />
        {info.type.includes("add") && (
          <>
            Replacement: <strong>{info.content.replacement}</strong>
            <br />
          </>
        )}
        {info.type.includes("all") && (
          <>
            Count: <strong>{info.content.count}</strong>
          </>
        )}
      </div>
    );
  };

  return (
    <Toast
      show={showToast}
      onClose={() => dispatch(setShowToast(false))}
      style={{
        position: "fixed",
        top: 90,
        right: 20,
        width: 200,
        zIndex: 1000,
      }}
      delay={5000}
      autohide
    >
      <Toast.Header>{toastAvailable && header(toastInfo)}</Toast.Header>
      <Toast.Body>
        {toastAvailable &&
          toastInfo.type.includes("replacement") &&
          replacementView(toastInfo)}
        {toastAvailable &&
          toastInfo.type.includes("meta") &&
          metaView(toastInfo)}
        {toastAvailable &&
          toastInfo.type.includes("suggestion") &&
          suggestionView(toastInfo)}
      </Toast.Body>
    </Toast>
  );
};

const TokenInput = ({ token, textId, showContextMenu }) => {
  const project = useSelector(selectProject);

  const bgColourMap = useSelector(selectBgColourMap);
  const dispatch = useDispatch();

  const [showTokenPopover, setShowTokenPopover] = useState(false);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    // Detect whether user is editing a token input
    if (
      (token.value !== token.currentValue ||
        (token.replacement && token.value === token.currentValue)) &&
      token.currentValue !== token.suggested_replacement &&
      token.currentValue !== token.replacement
    ) {
      // Check whether the token has been edited by the user or if the token value
      // has changed due to a suggestion. Does not trigger if replacement is appled to token already (auto-labelling)
      setEdited(true);
    } else {
      // remove edit state
      setEdited(false);
      setShowTokenPopover(false);
    }
  }, [token.currentValue]);

  const modifyToken = (targetValue) => {
    setShowTokenPopover(true);
    dispatch(updateCurrentValue({ token_id: token._id, value: targetValue }));
  };

  const bgColourChoice =
    edited || token.replacement
      ? bgColourMap["rp"]
      : token.value !== token.currentValue
      ? bgColourMap["st"]
      : token.colour;

  const popoverProps = {
    token,
    type: "addReplacement",
    dispatch,
    setShowTokenPopover,
    bgColourMap,
    textId,
    projectId: project._id,
  };

  return (
    <OverlayTrigger
      trigger="click"
      rootClose
      placement="bottom"
      overlay={popoverManager(popoverProps)}
      show={showTokenPopover}
    >
      <input
        className="token-input"
        type="text"
        name="token"
        placeholder={token.currentValue}
        value={token.currentValue}
        onChange={(e) => modifyToken(e.target.value)}
        style={{
          backgroundColor: bgColourChoice,
          width: token.width,
        }}
        autoComplete="off"
        title={`original: ${token.value}\nClass: ${token.clf}`}
        onContextMenu={(e) => showContextMenu(e)}
      />
    </OverlayTrigger>
  );
};

const TokenUnderline = ({ token, textId, edited }) => {
  const project = useSelector(selectProject);
  const bgColourMap = useSelector(selectBgColourMap);
  const dispatch = useDispatch();

  const [showPopover, setShowPopover] = useState(false);

  const hasEditOrReplacement =
    (token.value !== token.currentValue && edited) || token.replacement;
  const hasSuggestion = token.suggested_replacement;

  const dStyle = {
    width: token.width,
    backgroundColor: hasEditOrReplacement
      ? bgColourMap["rp"]
      : hasSuggestion
      ? bgColourMap["st"]
      : null,
  };

  const popoverReplaceProps = {
    token,
    type: "removeReplacementPopover",
    dispatch,
    setShowPopover,
    bgColourMap,
    projectId: project._id,
  };

  const popoverAddSuggestionProps = {
    token,
    type: "addSuggestionPopover",
    dispatch,
    setShowPopover,
    bgColourMap,
    textId,
    projectId: project._id,
  };

  const popover = hasEditOrReplacement
    ? popoverManager(popoverReplaceProps)
    : hasSuggestion
    ? popoverManager(popoverAddSuggestionProps)
    : null;

  return (
    <div
      className="token-underline-container"
      style={{
        justifyContent: !token.suggested_replacement ? "space-between" : null,
        width: token.width,
      }}
    >
      {(hasEditOrReplacement || hasSuggestion) && (
        <OverlayTrigger
          trigger="focus"
          placement="bottom"
          rootClose
          overlay={popover}
          show={showPopover}
        >
          <div
            className="token-underline"
            style={dStyle}
            onClick={() => setShowPopover(!showPopover)}
          />
        </OverlayTrigger>
      )}
    </div>
  );
};

const popoverManager = (props) => {
  const popoverData = {
    addReplacement: [
      {
        name: "Apply one",
        icon: <MdBookmark />,
        function: () => {
          props.dispatch(
            patchSingleReplacement({
              tokenId: props.token._id,
              replacement: props.token.currentValue,
              textId: props.textId,
              bgColourMap: props.bgColourMap,
            })
          );
          props.setShowTokenPopover(false);
        },
      },
      {
        name: "Apply all",
        icon: <MdBrush />,
        function: () => {
          props.dispatch(
            patchAllReplacements({
              textId: props.textId,
              tokenId: props.token._id,
              replacement: props.token.currentValue,
              originalValue: props.token.value,
              bgColourMap: props.bgColourMap,
              projectId: props.projectId,
            })
          );
          props.setShowTokenPopover(false);
        },
      },
      {
        name: "Ignore",
        icon: <MdDelete />,
        function: () => {
          if (props.token.replacement) {
            props.dispatch(
              updateCurrentValue({
                token_id: props.token._id,
                value: props.token.replacement,
              })
            );
          } else if (props.token.suggested_replacement) {
            props.dispatch(
              updateCurrentValue({
                token_id: props.token._id,
                value: props.token.suggested_replacement,
              })
            );
          } else {
            props.dispatch(
              updateCurrentValue({
                token_id: props.token._id,
                value: props.token.value,
              })
            );
          }
          props.setShowTokenPopover(false);
        },
      },
    ],
    removeReplacementPopover: [
      {
        name: "Remove",
        icon: <MdDelete />,
        function: () => {
          props.dispatch(
            deleteSingleReplacement({
              tokenId: props.token._id,
              bgColourMap: props.bgColourMap,
            })
          );
          props.setShowPopover(false);
        },
      },
      {
        name: "Remove all",
        icon: <MdDelete />,
        function: () => {
          props.dispatch(
            deleteAllReplacements({
              originalValue: props.token.value,
              replacement: props.token.replacement,
              bgColourMap: props.bgColourMap,
              projectId: props.projectId,
            })
          );
          props.setShowPopover(false);
        },
      },
    ],
    addSuggestionPopover: [
      {
        name: "Accept all",
        icon: <MdBookmark />,
        function: () => {
          props.dispatch(
            patchAllSuggestedReplacements({
              suggestedReplacement: props.token.suggested_replacement,
              originalValue: props.token.value,
              bgColourMap: props.bgColourMap,
              projectId: props.projectId,
            })
          );
          props.setShowPopover(false);
        },
      },
      {
        name: "Accept one",
        icon: <MdBookmark />,
        function: () => {
          props.dispatch(
            patchSingleSuggestedReplacement({
              textId: props.textId,
              tokenId: props.token._id,
              suggestedReplacement: props.token.currentValue,
            })
          );
          props.setShowPopover(false);
        },
      },
      {
        name: "Ignore",
        icon: <MdDelete />,
        function: () => {
          props.dispatch(
            deleteSingleSuggestedReplacement({
              tokenId: props.token._id,
              value: props.token.value,
            })
          );
          props.setShowPopover(false);
        },
      },
      {
        name: "Ignore all",
        icon: <MdDelete />,
        function: () => {
          props.dispatch(
            deleteAllSuggestedReplacements({
              suggestedReplacement: props.token.suggested_replacement,
              originalValue: props.token.value,
              bgColourMap: props.bgColourMap,
              projectId: props.projectId,
            })
          );
          props.setShowPopover(false);
        },
      },
    ],
  };

  return (
    <Popover id={props.type}>
      <div className="popover">
        <div id="text-container">
          <p id="original-text">{props.token.value}</p>
          <p id="arrow">
            <BsArrowRightShort />
          </p>
          <p id="suggested-text">{props.token.currentValue}</p>
        </div>
        <div id="action-container">
          {popoverData[props.type].map((action) => (
            <div id="action-btn" onClick={action.function}>
              <p id="action-text">
                {action.icon}
                {action.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Popover>
  );
};

const Paginator = () => {
  const project = useSelector(selectProject);
  const totalPages = useSelector(selectTotalPages);
  const page = useSelector(selectPage);

  const [pageSelected, setPageSelected] = useState("");

  const routeChange = (page) => {
    setPage(page);
    history.push(`/project/${project._id}/page/${page}`);
  };

  const ellipsisGo = (
    <OverlayTrigger
      trigger="click"
      rootClose
      placement="top"
      overlay={
        <Popover style={{ maxWidth: "100%", margin: "auto" }}>
          <Popover.Title style={{ margin: "0em" }}>
            <p style={{ textAlign: "center", margin: "0em" }}>
              <strong>Page</strong> (1 -{totalPages})
            </p>
          </Popover.Title>
          <Popover.Content>
            <div style={{ display: "flex", margin: "auto" }}>
              <input
                style={{ maxWidth: "100%" }}
                type="number"
                min="1"
                max={totalPages}
                step="1"
                value={pageSelected}
                onChange={(e) => setPageSelected(e.target.value)}
              />
              <Button
                id="action-btn"
                size="sm"
                onClick={() => routeChange(pageSelected)}
              >
                Go
              </Button>
            </div>
          </Popover.Content>
        </Popover>
      }
    >
      <Pagination.Ellipsis />
    </OverlayTrigger>
  );

  return (
    <div className="paginator">
      <Pagination>
        {page > 4 ? (
          <>
            <Pagination.First onClick={() => routeChange(1)} />
            <Pagination.Prev onClick={() => routeChange(page - 1)} />
            {ellipsisGo}
          </>
        ) : null}
        {page <= 4
          ? [...Array(totalPages < 5 ? totalPages : 5).keys()].map((number) => {
              return (
                <Pagination.Item
                  key={number + 1}
                  active={number + 1 === page}
                  onClick={() => routeChange(number + 1)}
                >
                  {number + 1}
                </Pagination.Item>
              );
            })
          : page < totalPages - 4
          ? [page - 3, page - 2, page - 1, page, page + 1].map((number) => {
              return (
                <Pagination.Item
                  key={number + 1}
                  active={number + 1 === page}
                  onClick={() => routeChange(number + 1)}
                >
                  {number + 1}
                </Pagination.Item>
              );
            })
          : [
              totalPages - 5,
              totalPages - 4,
              totalPages - 3,
              totalPages - 2,
              totalPages - 1,
            ].map((number) => {
              return (
                <Pagination.Item
                  key={number + 1}
                  active={number + 1 === page}
                  onClick={() => routeChange(number + 1)}
                >
                  {number + 1}
                </Pagination.Item>
              );
            })}
        {page < totalPages - 4 ? (
          <>
            {ellipsisGo}
            <Pagination.Next onClick={() => routeChange(page + 1)} />
            <Pagination.Last onClick={() => routeChange(totalPages)} />
          </>
        ) : null}
      </Pagination>
    </div>
  );
};

const SaveButton = () => {
  const project = useSelector(selectProject);
  const textTokenMap = useSelector(selectTextTokenMap);
  const dispatch = useDispatch();
  const [savePending, setSavePending] = useState(false);

  useEffect(() => {
    setSavePending(true);
  }, [dispatch]);

  return (
    <Dropdown
      as={ButtonGroup}
      className="save-button"
      style={{
        opacity: savePending ? "0.8" : "0.5",
        position: "fixed",
      }}
    >
      <Button
        style={{
          backgroundColor: savePending ? "rgb(107, 176, 191)" : "",
          borderColor: savePending ? "rgb(107, 176, 191)" : "",
          opacity: savePending ? "0.8" : "0.5",
        }}
        onClick={() =>
          dispatch(
            updateAnnotationStates({
              textIds: textTokenMap.map((text) => text._id),
              saveReplacementsOnly: false,
            })
          )
        }
        variant="secondary"
        title="Click to save the current pages suggested replacements and to mark all documents as annotated"
      >
        <div
          style={{
            display: "flex",
            fontWeight: "bold",
            alignItems: "center",
            fontSize: "0.8rem",
          }}
        >
          <FaSave style={{ marginRight: "0.5em" }} />
          Save All
        </div>
      </Button>
      <Dropdown.Toggle
        split
        variant="secondary"
        style={{
          backgroundColor: savePending ? "rgb(107, 176, 191)" : "",
          borderColor: savePending ? "rgb(107, 176, 191)" : "",
          opacity: savePending ? "0.8" : "0.5",
        }}
      />
      <Dropdown.Menu>
        <Dropdown.Item
          title="Click to save only the replacements made on the current page"
          onClick={() =>
            dispatch(
              updateAnnotationStates({
                textIds: textTokenMap.map((text) => text._id),
                saveReplacementsOnly: true,
              })
            )
          }
        >
          Save Replacements
        </Dropdown.Item>
        {/* <Dropdown.Item title="Undo the last action performed" disabled>
          Undo
        </Dropdown.Item> */}
      </Dropdown.Menu>
    </Dropdown>
  );
};
