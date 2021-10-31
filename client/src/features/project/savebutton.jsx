import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import "react-contexify/dist/ReactContexify.css";
import { FaSave } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import "./AnnotationTable.css";
import { fetchMetrics, selectProject } from "./projectSlice";
import { updateAnnotationStates } from "./textSlice";
import { selectTextTokenMap, setIdle } from "./tokenSlice";

export const SaveButton = () => {
  const project = useSelector(selectProject);
  const textTokenMap = useSelector(selectTextTokenMap);
  const dispatch = useDispatch();
  const [savePending, setSavePending] = useState(false);

  useEffect(() => {
    const textsNotAnnotated =
      textTokenMap &&
      textTokenMap.filter((text) => text.annotated).length !==
        textTokenMap.length;
    setSavePending(textsNotAnnotated);
  }, [textTokenMap, dispatch]);

  return (
    <Dropdown as={ButtonGroup} className="save-button">
      <Button
        id="save-page"
        pending={savePending && "true"}
        onClick={() => {
          dispatch(
            updateAnnotationStates({
              textIds: textTokenMap.map((text) => text._id),
              saveReplacementsOnly: false,
            })
          );
          dispatch(setIdle());
          dispatch(fetchMetrics({ projectId: project._id }));
        }}
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
          Save Page
        </div>
      </Button>
      <Dropdown.Toggle
        id="save-page"
        split
        variant="secondary"
        pending={savePending && "true"}
      />
      <Dropdown.Menu>
        <Dropdown.Item
          title="Click to save only the replacements made on the current page"
          onClick={() => {
            dispatch(
              updateAnnotationStates({
                textIds: textTokenMap.map((text) => text._id),
                saveReplacementsOnly: true,
              })
            );
            dispatch(setIdle());
            dispatch(fetchMetrics({ projectId: project._id }));
          }}
        >
          Save Replacements
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export const SaveIconBtn = () => {
  const project = useSelector(selectProject);
  const textTokenMap = useSelector(selectTextTokenMap);
  const dispatch = useDispatch();
  const [savePending, setSavePending] = useState(false);

  useEffect(() => {
    const textsNotAnnotated =
      textTokenMap &&
      textTokenMap.filter((text) => text.annotated).length !==
        textTokenMap.length;
    setSavePending(textsNotAnnotated);
  }, [textTokenMap, dispatch]);

  return (
    <FaSave
      id="icon"
      pending={savePending && "true"}
      onClick={() => {
        dispatch(
          updateAnnotationStates({
            textIds: textTokenMap.map((text) => text._id),
            saveReplacementsOnly: false,
          })
        );
        dispatch(setIdle());
        dispatch(fetchMetrics({ projectId: project._id }));
      }}
      title="Click to save the current pages suggested replacements and to mark all documents as annotated"
    />
  );
};
