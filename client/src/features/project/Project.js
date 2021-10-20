import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Spinner,
  Container,
  Row,
  Col,
  Button,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import { MdDelete, MdBrush, MdBookmark, MdBook } from "react-icons/md";
import { BsArrowRightShort } from "react-icons/bs";

import { createUseStyles } from "react-jss";
import "./Token.css";
import "./Text.css";
import {
  setSearchTerm,
  // addTokenToReplacementDict,
  selectProject,
  selectSearchTerm,
  selectBgColourMap,
  fetchProject,
  fetchProjectMaps,
} from "./projectSlice";
import {
  selectCurrentTexts,
  selectPageLimit,
  selectPage,
  fetchTexts,
  getTotalPages,
  setIdle,
  setPageLimit,
  setPage,
} from "./textSlice";
import {
  selectTextTokenMap,
  selectTokenValues,
  addTokens,
  addSingleReplacement,
  addAllReplacements,
  acceptSingleSuggestedReplacement,
  acceptAllSuggestedReplacements,
  updateSingleTokenDetails,
  updateAllTokenDetails,
  updateCurrentValue,
  removeSingleReplacement,
  removeAllReplacements,
  removeSingleSuggestedReplacement,
  removeAllSuggestedReplacements,
} from "./tokenSlice";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "80%",
    margin: "auto",
    marginTop: "4em",
    userSelect: "none", // Stops text from being selected on click
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1em",
    backgroundColor: "#F2F2F2",
    marginTop: "1em",
    minHeight: "100%",
    maxWidth: "100%",
  },
  textColumn: {
    marginLeft: "1em",
    minHeight: "2em",
    display: "flex",
    width: "90%",
  },
  indexColumn: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    verticalAlign: "middle",
  },
  indexIcon: {
    fontSize: "22px",
    fontWeight: "bold",
    width: "2em",
    height: "2em",
    margin: "auto",
  },
  textContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default function Test() {
  const classes = useStyles();

  const dispatch = useDispatch();

  const project = useSelector(selectProject);
  const projectStatus = useSelector((state) => state.project.status);
  const projectError = useSelector((state) => state.project.error);
  const bgColourMap = useSelector(selectBgColourMap);

  const currentTexts = useSelector(selectCurrentTexts);
  const pageLimit = useSelector(selectPageLimit);
  const page = useSelector(selectPage);
  const textsStatus = useSelector((state) => state.texts.status);
  const textsError = useSelector((state) => state.texts.error);

  const searchTerm = useSelector(selectSearchTerm);

  const textTokenMap = useSelector(selectTextTokenMap);

  useEffect(() => {
    if (projectStatus === "idle") {
      dispatch(fetchProject());
      dispatch(fetchProjectMaps());
    }
  }, [projectStatus, dispatch]);

  useEffect(() => {
    if (projectStatus === "succeeded" && textsStatus === "idle") {
      // Fetches the count of total pages based on current settings
      // and the texts associated with the current page.
      dispatch(
        getTotalPages({
          project_id: project._id,
          get_pages: true,
          search_term: searchTerm,
          page_limit: pageLimit,
        })
      );
      dispatch(
        fetchTexts({
          project_id: project._id,
          search_term: searchTerm,
          page_limit: pageLimit,
          page: page,
        })
      );
    }
    if (textsStatus === "succeeded") {
      dispatch(
        addTokens({
          textTokenMap: currentTexts.map((text) => ({
            text_id: text._id,
            token_ids: text.tokens.map((token) => token._id),
          })),
          tokens: currentTexts.map((text) => text.tokens.map((token) => token)),
        })
      );
      dispatch(
        updateAllTokenDetails({
          token_ids: currentTexts
            .map((text) => text.tokens.map((token) => token._id))
            .flat(),
          bgColourMap: bgColourMap,
        })
      );
    }
  }, [textsStatus, projectStatus, dispatch]);

  let projectContent;

  if (projectStatus === "loading") {
    projectContent = <Spinner />;
  } else if (projectStatus === "succeeded") {
    projectContent = <div>Project loaded - {project._id}</div>;
  } else if (projectStatus === "failed") {
    projectContent = <div>{projectError}</div>;
  }

  let textsContent;

  if (textsStatus === "loading") {
    textsContent = <Spinner />;
  } else if (textsStatus === "succeeded") {
    textsContent = (
      <div className={classes.container}>
        {textTokenMap &&
          textTokenMap.map((text, id) => {
            return (
              <div className={classes.row}>
                <div className={classes.indexColumn}>
                  <p className={classes.indexIcon}>
                    {id + 1 + (page - 1) * pageLimit}
                  </p>
                </div>
                <div className={classes.textColumn}>
                  <Text {...text.token_ids} />
                </div>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: "bold",
                    color: "grey",
                  }}
                  // onClick={() => handleTokenize(text._id)}
                >
                  x
                  {/* {tokenize !== text._id ? (
                    <CgMergeVertical />
                    ) : (
                    <CgMoreVertical />
                  )} */}
                </div>
              </div>
            );
          })}
      </div>
    );
  } else if (textsStatus === "failed") {
    textsContent = <div>{textsError}</div>;
  }

  return (
    <Container fluid>
      <Row>
        {/* <Col id="sidebar-wrapper"></Col> */}
        <Col id="page-content-wrapper">
          <p>Project status: {projectStatus}</p>
          {projectContent}
          <div>
            Search:
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
            <button onClick={() => dispatch(setIdle())}>Submit</button>
          </div>
          <div>
            Page Limit:
            <input
              type="number"
              value={pageLimit}
              onChange={(e) => dispatch(setPageLimit(Number(e.target.value)))}
            />
            <button onClick={() => dispatch(setIdle())}>Submit</button>
          </div>
          <div>
            Page:
            <input
              type="number"
              value={page}
              onChange={(e) => dispatch(setPage(Number(e.target.value)))}
            />
            <button onClick={() => dispatch(setIdle())}>Submit</button>
          </div>
          <p>Text status: {textsStatus}</p>
          {/* Annotation Table */}
          {textsContent}
        </Col>
      </Row>
    </Container>
  );
}

const Text = (tokens) => {
  return (
    <div className="text">
      {Object.values(tokens).map((token_id) => {
        return <Token token_id={token_id} />;
      })}
    </div>
  );
};

const Token = ({ token_id }) => {
  const tokenValues = useSelector(selectTokenValues);
  const token = tokenValues[token_id];

  return (
    <div className="token" key={token._id}>
      <TokenInput token={token} />
      <TokenUnderline token={token} />
    </div>
  );
};

const TokenInput = ({ token }) => {
  const bgColourMap = useSelector(selectBgColourMap);
  const dispatch = useDispatch();

  const [showTokenPopover, setShowTokenPopover] = useState(false);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    // Detect whether user is editing a token input
    if (
      token.value !== token.currentValue &&
      token.suggested_replacement !== token.currentValue &&
      !token.replacement
    ) {
      // Check whether the token has been edited by the user or if the token value
      // has changed due to a suggestion. Does not trigger if replacement is appled to token already (auto-labelling)
      setEdited(true);
      console.log("EDIT TRUE");
    } else {
      // remove edit state
      setEdited(false);
      console.log("EDIT FALSE");
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
  };

  return (
    <OverlayTrigger
      trigger="click"
      rootClose
      placement="bottom"
      overlay={popoverManager(
        popoverProps
        // token,
        // "addReplacement",
        // dispatch,
        // setShowTokenPopover
      )}
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
      />
    </OverlayTrigger>
  );
};

const TokenUnderline = ({ token, edited }) => {
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
  };

  const popoverAddSuggestionProps = {
    token,
    type: "addSuggestionPopover",
    dispatch,
    setShowPopover,
    bgColourMap,
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
        name: "Apply",
        icon: <MdBookmark />,
        // This function is the equivalent of addReplacement using isSingle: True
        // TODO: update to api call
        function: () => {
          props.dispatch(
            addSingleReplacement({
              token_id: props.token._id,
              replacement: props.token.currentValue,
              bgColourMap: props.bgColourMap,
            })
          );
          props.setShowTokenPopover(false);
        },
      },
      {
        name: "Apply all",
        icon: <MdBrush />,
        // This function is the equivalent of addReplacement using isSingle: False
        // TODO: update to api call
        function: () => {
          props.dispatch(
            addAllReplacements({
              token_id: props.token._id,
              replacement: props.token.currentValue,
              originalValue: props.token.value,
              bgColourMap: props.bgColourMap,
            })
          );
          props.setShowTokenPopover(false);
        },
      },
      {
        name: "Ignore",
        icon: <MdDelete />,
        // This function is the equivalent of 'cancelChange()'
        function: () => {
          if (props.token.suggested_replacement) {
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
            removeSingleReplacement({
              token_id: props.token._id,
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
            removeAllReplacements({
              originalValue: props.token.value,
              replacement: props.token.replacement,
              bgColourMap: props.bgColourMap,
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
            acceptAllSuggestedReplacements({
              suggestedReplacement: props.token.suggested_replacement,
              originalValue: props.token.value,
              bgColourMap: props.bgColourMap,
            })
          );
          props.setShowPopover(false);
        },
      },
      {
        name: "Accept",
        icon: <MdBookmark />,
        function: () => {
          props.dispatch(
            acceptSingleSuggestedReplacement({
              token_id: props.token._id,
              suggested_value: props.token.currentValue,
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
            removeSingleSuggestedReplacement({
              token_id: props.token._id,
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
            removeAllSuggestedReplacements({
              suggestedReplacement: props.token.suggested_replacement,
              originalValue: props.token.value,
              bgColourMap: props.bgColourMap,
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
