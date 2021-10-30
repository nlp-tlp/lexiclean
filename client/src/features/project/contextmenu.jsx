import React from "react";
import { Item, Menu, Submenu, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { IoMdArrowDropright } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveMaps,
  selectBgColourMap,
  selectProject,
} from "./projectSlice";
import {
  deleteAllMetaTags,
  deleteSingleMetaTag,
  patchAllMetaTags,
  patchSingleMetaTag,
} from "./tokenSlice";

export const ContextMenu = ({ menuId, token, textId }) => {
  const dispatch = useDispatch();
  const bgColourMap = useSelector(selectBgColourMap);
  const activeMaps = useSelector(selectActiveMaps);
  const project = useSelector(selectProject);

  const DEFAULT_MAPS = ["ua", "rp", "st"]; // Note: This excludes 'en'

  const applySingle = (field) => {
    dispatch(
      patchSingleMetaTag({
        tokenId: token._id,
        textId: textId,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
  };

  const applyAll = (field) => {
    dispatch(
      patchAllMetaTags({
        originalValue: token.value,
        projectId: project._id,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
  };

  const removeSingle = (field) => {
    dispatch(
      deleteSingleMetaTag({
        tokenId: token._id,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
  };

  const removeAll = (field) => {
    dispatch(
      deleteAllMetaTags({
        originalValue: token.value,
        projectId: project._id,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
  };

  return (
    <Menu id={menuId}>
      {Object.keys(bgColourMap)
        .filter(
          (key) =>
            !DEFAULT_MAPS.includes(key) && [...activeMaps, "en"].includes(key)
        )
        .map((item) => (
          <Submenu
            label={
              <div
                style={{
                  backgroundColor: token.meta_tags[item]
                    ? bgColourMap[item]
                    : null,
                  padding: "5px",
                  borderRadius: "5px",
                }}
              >
                {item}
              </div>
            }
            arrow={<IoMdArrowDropright />}
            theme={theme.light}
          >
            <Item onClick={() => applyAll(item)}>Apply all</Item>
            <Item onClick={() => applySingle(item)}>Apply one</Item>
            <Item onClick={() => removeSingle(item)}>Remove one</Item>
            <Item onClick={() => removeAll(item)}>Remove all</Item>
          </Submenu>
        ))}
    </Menu>
  );
};
