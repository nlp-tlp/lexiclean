import React, { useState, useEffect } from "react";
import "./Modals.css";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  ButtonGroup,
  ToggleButton,
  Table,
  OverlayTrigger,
  Popover,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { MdAddCircle, MdBrush } from "react-icons/md";
import { CompactPicker } from "react-color";
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
    console.log(tempMetaTag, tempColour);
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

  return (
    <div className="schema">
      <p>
        <strong>Info:</strong> Here you can make modifications to the meta-tag
        schema currently being used. This includes adding new tags, updating the
        colour or active state of existing ones.
      </p>
      <h5 id="description-title">Add New</h5>
      <Form>
        <Form.Group as={Row}>
          <Col md>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter meta-tag name"
              value={tempMetaTag}
              onChange={(e) => setTempMetaTag(e.target.value)}
            />
          </Col>
          <Col md>
            <Form.Label htmlFor="exampleColorInput">Color picker</Form.Label>
            <Form.Control
              type="color"
              id="exampleColorInput"
              defaultValue={DEFAULT_COLOUR}
              title="Choose your color"
              style={{ width: "50px" }}
              onChange={(e) => setTempColour(e.target.value)}
            />
          </Col>
        </Form.Group>
      </Form>
      <Button
        className="mb-3"
        disabled={tempMetaTag === ""}
        onClick={() => addMetaTag()}
      >
        Add
      </Button>

      <h5 id="description-title">Update Existing</h5>
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
                        <Form.Control
                          type="color"
                          id="exampleColorInput"
                          defaultValue={maps.contents[key].colour}
                          title="Choose your color"
                          // onChange={(e) => setTempColour(e.target.value)}
                          // Update with way to modify existing token colours etc.
                          style={{ width: "50px" }}
                        />
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
