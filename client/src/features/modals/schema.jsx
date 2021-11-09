import React, { useState } from "react";
import "./Modals.css";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  OverlayTrigger,
  Popover,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { IoBrush, IoCheckmark, IoClose } from "react-icons/io5";
import {
  selectProjectSchema,
  patchProjectSchema,
  changeMetaTagStatus,
} from "../../features/project/projectSlice";
import { setIdle } from "../../features/project/textSlice";

const getFontColour = (colour) => {
  // Get token contrast ratio (tests white against colour) if < 4.5 then sets font color to black
  const hexToRgb = (hex) =>
    hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r, g, b) => "#" + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));

  const luminance = (r, g, b) => {
    let a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const contrast = (rgb1, rgb2) => {
    let lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
    let lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
    let brightest = Math.max(lum1, lum2);
    let darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const ratioWhite = contrast(hexToRgb(colour), [255, 255, 255]);
  const ratioBlack = contrast(hexToRgb(colour), [0, 0, 0]);

  return ratioWhite > ratioBlack ? "white" : "black";
};

const DEFAULT_COLOUR = "#9B9B9B";
const DEFAULT_MAPS = ["rp", "ua", "st", "en"];

export const Schema = ({ projectId }) => {
  const dispatch = useDispatch();

  const [tempMetaTag, setTempMetaTag] = useState("");
  const [tempColour, setTempColour] = useState(DEFAULT_COLOUR);

  const maps = useSelector(selectProjectSchema);

  const addMetaTag = () => {
    // console.log(tempMetaTag, tempColour);
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ fontWeight: "bold", padding: "0", marginBottom: "1rem" }}>
          Colour picker
        </p>
        <Form.Control
          type="color"
          id="exampleColorInput"
          defaultValue={DEFAULT_COLOUR}
          title="Choose your color"
          style={{ width: "50px" }}
          onChange={(e) => setTempColour(e.target.value)}
        />
        <div
          style={{
            backgroundColor: "#cfd8dc",
            marginTop: "1rem",
            fontSize: "0.9rem",
            fontWeight: "bold",
            padding: "0.25rem",
            borderRadius: "0.25rem",
            border: "1px solid #b0bec5",
            opacity: "0.9",
            cursor: "pointer",
            "&:hover": {
              opacity: "1.0",
            },
          }}
        >
          Update
        </div>
      </div>
    </Popover>
  );

  return (
    <Container className="schema">
      <p>
        <strong>Info:</strong> Here you can make modifications to the meta-tag
        schema currently being used. This includes adding new tags, updating the
        colour or active state of existing ones.
      </p>
      <p style={{ fontSize: "1.5rem" }}>Tags</p>
      <Row style={{ maxHeight: "25vh", overflowY: "auto" }}>
        <Col>
          {maps ? (
            Object.keys(maps.contents)
              .filter((key) => !DEFAULT_MAPS.includes(key))
              .map((key) => (
                <Row>
                  <Col sm={6} md={8}>
                    <Row style={{ padding: "0.5rem" }} className="ml-1">
                      <div
                        id="tag-preview"
                        active={maps.contents[key].active && "true"}
                        style={{
                          backgroundColor: maps.contents[key].colour,
                          color: getFontColour(maps.contents[key].colour),
                        }}
                      >
                        {key[0]}
                      </div>
                      <div
                        id="tag-text"
                        active={maps.contents[key].active && "true"}
                      >
                        {key}
                      </div>
                    </Row>
                  </Col>
                  <Col sm={6} md={4}>
                    <Row
                      style={{
                        padding: "0.5rem",
                        display: "flex",
                        justifyContent: "right",
                        marginRight: "0.5rem",
                      }}
                    >
                      {/* <OverlayTrigger
                        trigger="click"
                        placement="left"
                        overlay={popover}
                      >
                        <div id="edit-button">
                          <IoBrush />
                        </div>
                      </OverlayTrigger> */}
                      <div
                        id="status-button"
                        active={maps.contents[key].active && "true"}
                        onClick={() =>
                          activateMap(key, !maps.contents[key].active)
                        }
                      >
                        {maps.contents[key].active ? (
                          <IoCheckmark />
                        ) : (
                          <IoClose />
                        )}
                      </div>
                    </Row>
                  </Col>
                </Row>
              ))
          ) : (
            <div>No tags in schema!</div>
          )}
        </Col>
      </Row>
      <Row
        className="mt-3"
        style={{
          justifyContent: "center",
          padding: "0.5rem",
          marginRight: "0.25rem",
        }}
      >
        <Col>
          <Form>
            <Form.Group>
              <Row>
                <Col sm={4} md={6}>
                  <Form.Control
                    type="text"
                    size="sm"
                    style={{ width: "100%" }}
                    placeholder="Enter a tag name"
                    value={tempMetaTag}
                    onChange={(e) => setTempMetaTag(e.target.value)}
                  />
                </Col>
                <Col
                  sm={4}
                  md={3}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Form.Control
                    type="color"
                    size="sm"
                    id="exampleColorInput"
                    defaultValue={DEFAULT_COLOUR}
                    title="Choose your color"
                    style={{ width: "50px" }}
                    onChange={(e) => setTempColour(e.target.value)}
                  />
                </Col>
                <Col
                  sm={4}
                  md={3}
                  style={{ display: "flex", justifyContent: "left" }}
                >
                  <Button
                    size="sm"
                    variant="dark"
                    disabled={tempMetaTag === ""}
                    onClick={() => addMetaTag()}
                  >
                    Create
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
