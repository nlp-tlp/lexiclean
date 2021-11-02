import React from "react";
import history from "../utils/history";
import { Item, Menu, Submenu, theme, Separator } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import "./ContextMenu.css";
import { IoMdArrowDropright, IoMdSearch } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchTerm,
  selectActiveMaps,
  selectBgColourMap,
  selectProject,
  fetchMetrics,
} from "./projectSlice";
import {
  deleteAllMetaTags,
  deleteSingleMetaTag,
  patchAllMetaTags,
  patchSingleMetaTag,
  setIdle,
} from "./tokenSlice";
import { setPage } from "./textSlice";

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
    dispatch(fetchMetrics({ projectId: project._id }));
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
    dispatch(fetchMetrics({ projectId: project._id }));
  };

  const removeSingle = (field) => {
    dispatch(
      deleteSingleMetaTag({
        tokenId: token._id,
        field: field,
        bgColourMap: bgColourMap,
      })
    );
    dispatch(fetchMetrics({ projectId: project._id }));
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
    dispatch(fetchMetrics({ projectId: project._id }));
  };

  const quickSearch = (value) => {
    dispatch(setSearchTerm(value));
    // Apply filter and take user to first page
    dispatch(setPage(1));
    history.push(`/project/${project._id}/page/1`);
    dispatch(setIdle());
  };

  return (
    <Menu id={menuId} style={{
      // maxHeight: "10vh"
    }}>
      <Item disabled>Tags</Item>
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
      <Separator />
      <Item onClick={() => quickSearch(token.currentValue)}>
        <IoMdSearch /> Quick Search
      </Item>
    </Menu>
  );
};
