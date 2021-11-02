import React, { useState } from "react";
import "./Paginator.css";
import { Button, OverlayTrigger, Pagination, Popover } from "react-bootstrap";
import { useSelector } from "react-redux";
import history from "../utils/history";
import { selectProject } from "./projectSlice";
import {
  selectPage,
  selectTotalPages,
  selectPageLimit,
  setPage,
} from "./textSlice";
import { selectTextTokenMap } from "./tokenSlice";

export const Paginator = () => {
  const project = useSelector(selectProject);
  const totalPages = useSelector(selectTotalPages);
  const page = useSelector(selectPage);
  const pageLimit = useSelector(selectPageLimit);
  const textTokenMap = useSelector(selectTextTokenMap);

  const [pageSelected, setPageSelected] = useState("");

  const routeChange = (page) => {
    setPage(page);
    history.push(`/project/${project._id}/page/${page}`);
  };

  const ellipsisGo = (
    <OverlayTrigger
      trigger="click"
      rootClose
      placement="top"
      overlay={
        <Popover style={{ maxWidth: "100%", margin: "auto" }}>
          <Popover.Title style={{ margin: "0em" }}>
            <p style={{ textAlign: "center", margin: "0em" }}>
              <strong>Page</strong> (1 -{totalPages})
            </p>
          </Popover.Title>
          <Popover.Content>
            <div style={{ display: "flex", margin: "auto" }}>
              <input
                style={{ maxWidth: "100%", marginRight: "0.5rem" }}
                type="number"
                min="1"
                max={totalPages}
                step="1"
                value={pageSelected}
                onChange={(e) => setPageSelected(e.target.value)}
              />
              <Button
                id="action-btn"
                size="sm"
                variant="secondary"
                onClick={() => routeChange(pageSelected)}
              >
                Go
              </Button>
            </div>
          </Popover.Content>
        </Popover>
      }
    >
      <Pagination.Ellipsis />
    </OverlayTrigger>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="paginator">
        <Pagination>
          {page > 4 && (
            <>
              <Pagination.First onClick={() => routeChange(1)} />
              <Pagination.Prev onClick={() => routeChange(page - 1)} />
              {ellipsisGo}
            </>
          )}
          {page <= 4
            ? [...Array(totalPages < 5 ? totalPages : 5).keys()].map(
                (number) => {
                  return (
                    <Pagination.Item
                      key={number + 1}
                      active={number + 1 === page}
                      onClick={() => routeChange(number + 1)}
                    >
                      {number + 1}
                    </Pagination.Item>
                  );
                }
              )
            : page < totalPages - 4
            ? [page - 3, page - 2, page - 1, page, page + 1].map((number) => {
                return (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === page}
                    onClick={() => routeChange(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                );
              })
            : [
                totalPages - 5,
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
              ].map((number) => {
                return (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === page}
                    onClick={() => routeChange(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                );
              })}
          {page < totalPages - 4 && (
            <>
              {ellipsisGo}
              <Pagination.Next onClick={() => routeChange(page + 1)} />
              <Pagination.Last onClick={() => routeChange(totalPages)} />
            </>
          )}
        </Pagination>
      </div>
      <p id="paginator-detail">
        {totalPages === 1 && textTokenMap.length === 1
          ? "Showing 1 of 1"
          : totalPages === 1
          ? `Showing 1 to ${textTokenMap.length} documents`
          : `Showing ${(page - 1) * pageLimit + 1} to ${page * pageLimit} of ${
              pageLimit * totalPages
            } documents`}
      </p>
    </div>
  );
};
