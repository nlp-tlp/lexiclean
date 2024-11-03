import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../Create.css";
import {
  addReplacement,
  deleteReplacement,
  selectReplacements,
} from "../../createStepSlice";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export const ReplacementEditor = () => {
  const dispatch = useDispatch();
  const replacements = useSelector(selectReplacements);

  const [newReplacementKey, setNewReplacementKey] = useState("");
  const [newReplacementValue, setNewReplacementValue] = useState("");

  const handleNewReplacement = () => {
    dispatch(addReplacement({ [newReplacementKey]: newReplacementValue }));
    setNewReplacementKey("");
    setNewReplacementValue("");
  };
  return (
    <>
      <div
        style={{
          height: "20vh",
          overflowY: "auto",
          border: "1px solid #b0bec5",
          backgroundColor: "rgba(0, 0, 0, 0.025)",
          color: Object.keys(replacements).length === 0 && "grey",
          padding: Object.keys(replacements).length === 0 && "0.5rem",
        }}
      >
        {Object.keys(replacements).length === 0 ? (
          "Add or upload replacements"
        ) : (
          <>
            {replacements &&
              Object.keys(replacements)
                .sort()
                .map((key) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.25rem 2rem",
                        marginBottom: "0.25rem",
                        backgroundColor: "white",
                      }}
                    >
                      {key} : {replacements[key]}
                      <CloseIcon
                        id="remove-button"
                        onClick={() => dispatch(deleteReplacement(key))}
                      />
                    </div>
                  );
                })}
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "0.5rem",
          justifyContent: "center",
          fontSize: "0.875rem",
        }}
      >
        <strong style={{ marginRight: "0.375rem" }}>Add Pair</strong>
        <input
          type="text"
          style={{ width: "5rem", margin: "0rem 0.25rem", textAlign: "center" }}
          value={newReplacementKey}
          placeholder={"OOV Token"}
          onChange={(e) => setNewReplacementKey(e.target.value)}
        />

        <strong>:</strong>

        <input
          type="text"
          style={{ width: "5rem", margin: "0rem 0.25rem", textAlign: "center" }}
          value={newReplacementValue}
          placeholder={"IV Token"}
          onChange={(e) => setNewReplacementValue(e.target.value)}
        />
        {newReplacementKey !== "" && newReplacementValue !== "" && (
          <AddIcon id="add-button" onClick={() => handleNewReplacement()} />
        )}
      </div>
    </>
  );
};
