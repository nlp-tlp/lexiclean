import React, { useState, useEffect } from "react";
import axios from "../utils/api-interceptor";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  ButtonGroup,
  ToggleButton,
  Table,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import { MdAddCircle, MdBrush } from "react-icons/md";
import { CompactPicker } from "react-color";

import "./Modals.css";

import {
  selectProjectSchema,
  patchProjectSchema,
  changeMetaTagStatus,
} from "../../features/project/projectSlice";

import { setIdle } from "../../features/project/textSlice";

const DEFAULT_COLOUR = "#9B9B9B";
const DEFAULT_MAPS = ["rp", "ua", "st", "en"];

export const Schema = ({ projectId }) => {
  const dispatch = useDispatch();

  const [tempMetaTag, setTempMetaTag] = useState("");
  const [tempColour, setTempColour] = useState(DEFAULT_COLOUR);

  const maps = useSelector(selectProjectSchema);

  const addMetaTag = () => {
    dispatch(
      patchProjectSchema({
        projectId: projectId,
        metaTag: tempMetaTag,
        colour: tempColour,
      })
    );
    setTempMetaTag("");
    setTempColour(DEFAULT_COLOUR);
    // TODO: trigger table to load added tag
  };

  const activateMap = (key, status) => {
    const mapId = maps.contents[key]._id;
    dispatch(
      changeMetaTagStatus({ mapId: mapId, metaTag: key, status: status })
    );
    dispatch(setIdle());
    // TODO: trigger token colour and context menu to reload...
  };

  const popover = (
    <Popover id="popover-colour">
      <Popover.Title>Select Colour</Popover.Title>
      <Popover.Content>
        <CompactPicker
          color={tempColour}
          onChange={(color) => setTempColour(color.hex)}
          onChangeComplete={(color) => setTempColour(color.hex)}
        />
      </Popover.Content>
    </Popover>
  );

  return (
    <div className="schema">
      <h5 id="description-title">New Meta Tags</h5>
      <p>Here additional meta tags can be added</p>
      {maps ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Colour</th>
              <th>Status</th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="text"
                  value={tempMetaTag}
                  onChange={(e) => setTempMetaTag(e.target.value)}
                />
              </td>
              <td>
                <OverlayTrigger
                  trigger="click"
                  placement="left"
                  overlay={popover}
                >
                  <Button
                    style={{
                      borderColor: tempColour,
                      backgroundColor: tempColour,
                      padding: "0.2em",
                    }}
                  >
                    <MdBrush />
                  </Button>
                </OverlayTrigger>
              </td>
              <td id="active-state">Active</td>
              <td>
                {tempMetaTag !== "" ? (
                  <MdAddCircle id="add-btn" onClick={() => addMetaTag()} />
                ) : null}
              </td>
            </tr>
          </tbody>
        </Table>
      ) : null}

      <h5 id="description-title">Modify Existing Meta Tags</h5>
      <p>Here existing meta tags can have their active state changed</p>
      {maps ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Colour</th>
              <th>Active State</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(maps.contents).length > 0
              ? Object.keys(maps.contents)
                  .filter((key) => !DEFAULT_MAPS.includes(key))
                  .map((key) => (
                    <tr>
                      <td>{key}</td>
                      <td>
                        <Button
                          disabled
                          style={{
                            borderColor: maps.contents[key].colour,
                            backgroundColor: maps.contents[key].colour,
                            padding: "0.2em",
                          }}
                        >
                          <MdBrush style={{ color: "white" }} />
                        </Button>
                      </td>
                      <td style={{ fontWeight: "bolder" }}>
                        <ButtonGroup toggle>
                          <ToggleButton
                            key="toggle-active"
                            type="radio"
                            name="toggle-active"
                            checked={maps.contents[key].active}
                            onChange={() => activateMap(key, true)}
                          >
                            Active
                          </ToggleButton>
                          <ToggleButton
                            key="toggle-active"
                            type="radio"
                            name="toggle-active"
                            checked={!maps.contents[key].active}
                            onChange={() => activateMap(key, false)}
                          >
                            Inactive
                          </ToggleButton>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))
              : null}
          </tbody>
        </Table>
      ) : null}
    </div>
  );
};
