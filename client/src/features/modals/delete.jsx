import React, { useState } from "react";
import { Spinner, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { setActiveModal } from "../../features/project/projectSlice";
import {
  selectDeletingProject,
  deleteProject,
} from "../feed/feedSlice";
import "./Modals.css";

export const Delete = ({ projectId, projectName }) => {
  const dispatch = useDispatch();
  const deletingProject = useSelector(selectDeletingProject);
  const [valueMatched, setValueMatched] = useState(false);
  const checkValueMatch = (value) => {
    setValueMatched(value === projectName);
  };
  const deleteHandler = async () => {
    dispatch(deleteProject({ projectId: projectId }));
    dispatch(setActiveModal(null));
  };

  return (
    <>
      {deletingProject ? (
        <div className="delete-loading">
          <p id="loading-text">Deleting project - this may take a minute...</p>
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="delete">
          <p>
            Please enter <strong>{projectName}</strong> in the field below to
            delete this project
          </p>
          <input
            id="input-text"
            type="text"
            placeholder="Enter project name here"
            autoComplete={false}
            onChange={(e) => checkValueMatch(e.target.value)}
          />
          <div id="button">
            <Button
              variant="danger"
              disabled={!valueMatched}
              onClick={() => deleteHandler()}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
