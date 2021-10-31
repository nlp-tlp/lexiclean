import React, { useEffect, useState } from "react";
import { OverlayTrigger } from "react-bootstrap";
import { useContextMenu } from "react-contexify";
import { useDispatch, useSelector } from "react-redux";
import { ContextMenu } from "./contextmenu";
import { PopoverManager } from "./popovermanager";
import { selectBgColourMap, selectProject } from "./projectSlice";
import "./Token.css";
import { selectTokenValues, updateCurrentValue } from "./tokenSlice";

export const Token = ({ tokenId, textId }) => {
  const tokenValues = useSelector(selectTokenValues);
  const token = tokenValues[tokenId];
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

const TokenInput = ({ token, textId, showContextMenu }) => {
  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const bgColourMap = useSelector(selectBgColourMap);
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
      // has changed due to a suggestion.
      // Does not trigger if replacement is appled to token already (auto-labelling)
      setEdited(true);
    } else {
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
      overlay={PopoverManager(popoverProps)}
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
          color: token.fontColour,
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
    ? PopoverManager(popoverReplaceProps)
    : hasSuggestion
    ? PopoverManager(popoverAddSuggestionProps)
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
