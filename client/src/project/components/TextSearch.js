import React from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";

export default function TextSearch({
  tempValue,
  setTempValue,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <InputGroup className="sidebar-textsearch">
      <FormControl
        className="input"
        placeholder="Enter term to filter"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
      />
      <InputGroup.Append>
        <Button
          variant="dark"
          disabled={tempValue === ""}
          onClick={() => setSearchTerm(tempValue)}
        >
          Search
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => {
            setSearchTerm("");
            setTempValue("");
          }}
        >
          Reset
        </Button>
      </InputGroup.Append>
    </InputGroup>
  );
}
