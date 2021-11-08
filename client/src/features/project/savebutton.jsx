import React, { useEffect, useState } from "react";
import "./SaveButton.css";
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchMetrics, selectProject } from "./projectSlice";
import { updateAnnotationStates } from "./textSlice";
import { selectTextTokenMap, setIdle } from "./tokenSlice";
import { VscSaveAll, VscSave } from "react-icons/vsc";

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
    <Dropdown as={ButtonGroup} className="save-button-group">
      <Button
        id="save-page-button"
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
        <div>
          <VscSaveAll id="save-page-icon" />
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
          <div>
            <VscSave id="save-page-icon" />
            Save Replacements
          </div>
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
    <VscSaveAll
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
