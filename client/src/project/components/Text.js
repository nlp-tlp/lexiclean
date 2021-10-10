import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import Token from "./Token";
import Tokenize from "./Tokenize";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default function Text({
  project,
  text,
  replacementDict,
  setReplacementDict,
  metaTagSuggestionMap,
  setMetaTagSuggestionMap,
  bgColourMap,
  tokenize,
  changeTrigger,
  setChangeTrigger,
  setToastInfo,
  activeMaps,
  setSavePending,
  schemaTrigger,
}) {
  const classes = useStyles();
  const textId = text._id ? text._id : null;
  const [textIntermediate, setTextIntermediate] = useState(text);

  return (
    <div id="text-container" className={classes.container} key={textId}>
      {tokenize === textId && project ? (
        <Tokenize
          project={project}
          textIntermediate={textIntermediate}
          setTextIntermediate={setTextIntermediate}
        />
      ) : textIntermediate ? (
        textIntermediate.tokens.map((tokenInfo) => {
          const tokenProps = {
            tokenInfo,
            textId,
            replacementDict,
            setReplacementDict,
            metaTagSuggestionMap,
            setMetaTagSuggestionMap,
            bgColourMap,
            changeTrigger,
            setChangeTrigger,
            setToastInfo,
            activeMaps,
            setSavePending,
            schemaTrigger,
          };
          return <Token {...tokenProps} />;
        })
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
