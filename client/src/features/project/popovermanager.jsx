import React from "react";
import { Popover } from "react-bootstrap";
import { BsArrowRightShort } from "react-icons/bs";
import { MdBookmark, MdBrush, MdDelete, MdCallSplit } from "react-icons/md";
import "./Token.css";
import {
  deleteAllReplacements,
  deleteAllSuggestedReplacements,
  deleteSingleReplacement,
  deleteSingleSuggestedReplacement,
  patchAllReplacements,
  patchAllSuggestedReplacements,
  patchSingleReplacement,
  patchSingleSuggestedReplacement,
  patchSingleTokenSplit,
  updateCurrentValue,
} from "./tokenSlice";
import { fetchMetrics } from "./projectSlice";

export const PopoverManager = (props) => {
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
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
      {
        name: "Split",
        icon: <MdCallSplit />,
        function: () => {
          props.dispatch(
            patchSingleTokenSplit({
              textId: props.textId,
              tokenId: props.token._id,
              currentValue: props.currentValue,
              bgColourMap: props.bgColourMap
            })
          );
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
          props.dispatch(fetchMetrics({ projectId: props.projectId }));
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
          {popoverData[props.type].map((action) => {
            if (
              action.name.toLowerCase() === "split" &&
              props.token.currentValue &&
              props.token.currentValue.indexOf(" ") >= 0
            ) {
              return (
                <div
                  id="action-btn"
                  onClick={action.function}
                  style={{ borderTop: "1px solid lightgrey" }}
                >
                  <p id="action-text">
                    {action.icon}
                    {action.name}
                  </p>
                </div>
              );
            } else if (action.name.toLowerCase() !== "split") {
              return (
                <div id="action-btn" onClick={action.function}>
                  <p id="action-text">
                    {action.icon}
                    {action.name}
                  </p>
                </div>
              );
            }
          })}
        </div>
      </div>
    </Popover>
  );
};
