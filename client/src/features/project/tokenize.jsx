import React, { useEffect, useState } from "react";
import "./Text.css";
import "./Token.css";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { IoInformationCircleSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import TokenizeGif from "../../media/tokenize.gif";
import {
  patchSingleTokenization,
  selectTokenValues,
  setTokenizeTextId,
  setIdle,
  updateCurrentValue,
} from "./tokenSlice";
import { selectProject, selectBgColourMap } from "./projectSlice";

export const Tokenize = ({ tokenIds, textId }) => {
  const dispatch = useDispatch();
  const tokenValues = useSelector(selectTokenValues);
  const [tokenIndexes, setTokenIndexes] = useState(new Set());
  const [tokenIndexGroups, setTokenIndexGroups] = useState([]);
  const [valid, setValid] = useState(false);
  const project = useSelector(selectProject);
  const bgColourMap = useSelector(selectBgColourMap);

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
          Object.values(tokenIds).map((token_id, token_index) => {
            const token = tokenValues[token_id];
            const value = token.replacement ? token.replacement : token.value;
            const colour = tokenIndexes.has(token_index)
              ? "#43a047"
              : "#ffeb3b";
            // TODO: Integrate into utlity function that is shared across components
            // 60 is MIN_TOKEN_WIDTH
            const width =
              (value.length + 2) * 10 < 60
                ? "60px"
                : `${(value.length + 2) * 10}px`;

            return (
              <div
                id="token"
                style={{
                  backgroundColor: colour,
                  width: width,
                }}
                onClick={() => handleIndex(token_index)} // token.index
              >
                {value}
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
              patchSingleTokenization({
                textId: textId,
                projectId: project._id,
                indexGroupsTC: tokenIndexGroups,
                bgColourMap: bgColourMap,
              })
            );
            // dispatch(setTokenizeTextId(null));
            // dispatch(setIdle());
          }}
        >
          Apply
        </Button>
        {/* <Button id="action-button" size="sm" disabled>
            Apply all
          </Button> */}
        <Button
          id="action-button"
          size="sm"
          disabled={tokenIndexes.size === 0}
          onClick={() => setTokenIndexes(new Set())}
        >
          Clear
        </Button>
        <OverlayTrigger trigger="click" placement="right" overlay={infoPopover}>
          <IoInformationCircleSharp id="action-info" />
        </OverlayTrigger>
      </div>
    </div>
  );
};
