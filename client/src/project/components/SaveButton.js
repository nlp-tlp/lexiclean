import React from "react";
import { FaSave } from "react-icons/fa";
import axios from "../../common/utils/api-interceptor";

import { ButtonGroup, Button, Dropdown } from "react-bootstrap";

export default function SaveButton({
  project,
  currentTexts,
  saveTrigger,
  setSaveTrigger,
  savePending,
  setSavePending,
  setSaveReplacementsOnly
}) {
  const savePageResults = async (replacements_only) => {
    if (project._id) {
      const response = await axios.patch(
        `/api/token/suggest/accept/${project._id}`,
        {
          textIds: currentTexts.map((text) => text._id),
          replacements_only: replacements_only,
        }
      );
      if (response.status === 200) {
        setSaveReplacementsOnly(replacements_only);
        setSavePending(false);
        setSaveTrigger(!saveTrigger);
      }
    }
  };

  return (
    <Dropdown
      as={ButtonGroup}
      className="save-button"
      style={{
        opacity: savePending ? "0.8" : "0.5",
        position: "fixed",
      }}
    >
      <Button
        style={{
          backgroundColor: savePending ? "rgb(107, 176, 191)" : "",
          borderColor: savePending ? "rgb(107, 176, 191)" : "",
          opacity: savePending ? "0.8" : "0.5",
        }}
        onClick={() => savePageResults(false)}
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
          Save All
        </div>
      </Button>
      <Dropdown.Toggle
        split
        variant="secondary"
        style={{
          backgroundColor: savePending ? "rgb(107, 176, 191)" : "",
          borderColor: savePending ? "rgb(107, 176, 191)" : "",
          opacity: savePending ? "0.8" : "0.5",
        }}
      />
      <Dropdown.Menu>
        <Dropdown.Item
          title="Click to save only the replacements made on the current page"
          onClick={() => savePageResults(true)}
        >
          Save Replacements
        </Dropdown.Item>
        {/* <Dropdown.Item title="Undo the last action performed" disabled>
          Undo
        </Dropdown.Item> */}
      </Dropdown.Menu>
    </Dropdown>
  );
}
