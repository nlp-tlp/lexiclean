import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { MdDelete, MdBrush, MdBookmark, MdBook } from "react-icons/md";
import { BsArrowRightShort } from "react-icons/bs";
import { CgMergeVertical, CgMoreVertical } from "react-icons/cg";
import { IoInformationCircleSharp } from "react-icons/io5";
import TokenizeGif from "../../common/media/tokenize.gif";

import "./AnnotationTable.css";
import "./Text.css";
import "./Token.css";
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
  selectTokenizeTextId,
  fetchTexts,
  getTotalPages,
  setIdle,
  setPageLimit,
  setPage,
  setTokenizeTextId,
} from "./textSlice";
import {
  selectTextTokenMap,
  selectTokenValues,
  addTokens,
  addSingleReplacement,
  addAllReplacements,
  acceptSingleSuggestedReplacement,
  acceptAllSuggestedReplacements,
  applySingleTokenization,
  updateSingleTokenDetails,
  updateAllTokenDetails,
  updateCurrentValue,
  removeSingleReplacement,
  removeAllReplacements,
  removeSingleSuggestedReplacement,
  removeAllSuggestedReplacements,
  patchSingleReplacement,
} from "./tokenSlice";

export default function Test() {
  const dispatch = useDispatch();

  const project = useSelector(selectProject);
  const projectStatus = useSelector((state) => state.project.status);
  const projectError = useSelector((state) => state.project.error);
  const bgColourMap = useSelector(selectBgColourMap);
  const searchTerm = useSelector(selectSearchTerm);

  const currentTexts = useSelector(selectCurrentTexts);
  const pageLimit = useSelector(selectPageLimit);
  const page = useSelector(selectPage);
  const textsStatus = useSelector((state) => state.texts.status);
  const textsError = useSelector((state) => state.texts.error);
  const tokenizeTextId = useSelector(selectTokenizeTextId);

  const textTokenMap = useSelector(selectTextTokenMap);

  useEffect(() => {
    // Loader for project information
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
      <div className="annotation-table">
        {textTokenMap &&
          textTokenMap.map((text, id) => {
            return (
              <div id="row">
                <div id="index-column">
                  <p id="icon">{id + 1 + (page - 1) * pageLimit}</p>
                </div>
                <div id="text-column">
                  {tokenizeTextId === text.text_id ? (
                    <Tokenize tokenIds={text.token_ids} textId={text.text_id} />
                  ) : (
                    <Text tokenIds={text.token_ids} textId={text.text_id} />
                  )}
                </div>
                <div
                  id="tokenize-icon"
                  onClick={() =>
                    dispatch(
                      setTokenizeTextId(
                        tokenizeTextId === text.text_id ? null : text.text_id
                      )
                    )
                  }
                >
                  {/* TODO: Make icon coloured if the text has been tokenized */}
                  {tokenizeTextId === text.text_id ? (
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
              min={1}
              onChange={(e) => {
                dispatch(setPageLimit(Number(e.target.value)));
                dispatch(setIdle());
              }}
            />
          </div>
          <div>
            Page:
            <input
              type="number"
              value={page}
              min={1}
              onChange={(e) => {
                dispatch(setPage(Number(e.target.value)));
                dispatch(setIdle());
              }}
            />
          </div>
          <p>Text status: {textsStatus}</p>
          {/* Annotation Table */}
          <div>
            <button>Undo</button>
            <button>Redo</button>
          </div>
          {textsContent}
        </Col>
      </Row>
    </Container>
  );
}

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

  return (
    <div className="token" key={token._id}>
      <TokenInput token={token} textId={textId} />
      <TokenUnderline token={token} textId={textId} />
    </div>
  );
};

const TokenInput = ({ token, textId }) => {
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
      />
    </OverlayTrigger>
  );
};

// TODO: connect up edited status...
const TokenUnderline = ({ token, textId, edited }) => {
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
    textId,
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
            patchSingleReplacement({
              tokenId: props.token._id,
              replacement: props.token.currentValue,
              textId: props.textId,
              bgColourMap: props.bgColourMap,
            })
          );
          // props.dispatch(
          //   addSingleReplacement({
          //     token_id: props.token._id,
          //     replacement: props.token.currentValue,
          //     bgColourMap: props.bgColourMap,
          //   })
          // );
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
        name: "Accept one",
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
