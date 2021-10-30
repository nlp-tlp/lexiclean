import React, { useEffect } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import {
  IoCheckmarkCircleSharp,
  IoCloseCircle,
  IoEllipsisVerticalCircleSharp,
} from "react-icons/io5";
import { RiEditCircleFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "./AnnotationTable.css";
import { ContextToast } from "./contexttoast";
import { Paginator } from "./paginator";
import {
  fetchProject,
  fetchProjectMaps,
  selectBgColourMap,
  selectProject,
  selectSearchTerm,
} from "./projectSlice";
import { SaveButton } from "./savebutton";
import { Sidebar } from "./sidebar";
import { Text } from "./text";
import {
  getTotalPages,
  selectPage,
  selectPageLimit,
  selectTokenizeTextId,
  setPage,
  setTokenizeTextId,
} from "./textSlice";
import { Tokenize } from "./tokenize";
import {
  fetchTokens,
  selectShowToast,
  selectTextTokenMap,
  setIdle,
  updateAllTokenDetails,
  patchSingleAnnotationState,
} from "./tokenSlice";

export const Project = () => {
  const dispatch = useDispatch();

  const { projectId: activeProjectId } = useParams();
  let { pageNumber } = useParams();

  const project = useSelector(selectProject);
  const projectStatus = useSelector((state) => state.project.status);
  const projectError = useSelector((state) => state.project.error);
  const bgColourMap = useSelector(selectBgColourMap);
  const searchTerm = useSelector(selectSearchTerm);
  const showToast = useSelector(selectShowToast);

  const pageLimit = useSelector(selectPageLimit);
  const page = useSelector(selectPage);
  const textsError = useSelector((state) => state.texts.error);
  const tokenizeTextId = useSelector(selectTokenizeTextId);

  const tokensStatus = useSelector((state) => state.tokens.status);
  const tokensError = useSelector((state) => state.tokens.error);

  const textTokenMap = useSelector(selectTextTokenMap);

  useEffect(() => {
    // Updates texts whenever page is changed...
    dispatch(setPage(pageNumber));
    dispatch(setIdle());
  }, [pageNumber]);

  useEffect(() => {
    // Loader for project information
    if (activeProjectId && projectStatus === "idle") {
      dispatch(fetchProject({ projectId: activeProjectId }));
      dispatch(fetchProjectMaps({ projectId: activeProjectId }));
    }
  }, [activeProjectId, projectStatus, dispatch]);

  useEffect(() => {
    if (
      activeProjectId &&
      projectStatus === "succeeded" &&
      tokensStatus === "idle"
    ) {
      // Fetches the count of total pages based on current settings
      // and the tokens associated with the texts on the current page.
      dispatch(
        getTotalPages({
          project_id: project._id,
          get_pages: true,
          search_term: searchTerm,
          page_limit: pageLimit,
        })
      );
      dispatch(
        fetchTokens({
          project_id: project._id,
          search_term: searchTerm,
          page_limit: pageLimit,
          page: page,
        })
      );
    }
    if (tokensStatus === "succeeded") {
      dispatch(
        updateAllTokenDetails({
          token_ids: textTokenMap.map((text) => text.token_ids).flat(),
          bgColourMap: bgColourMap,
        })
      );
    }
  }, [tokensStatus, projectStatus, dispatch]);

  let textsContent;
  if (tokensStatus === "loading") {
    textsContent = <Spinner />;
  } else if (tokensStatus === "succeeded") {
    textsContent = (
      <div className="annotation-table">
        {textTokenMap &&
          textTokenMap.map((text, id) => {
            return (
              <div id="container">
                <div id="index-column" annotated={text.annotated && "true"}>
                  <div id="icon">{id + 1 + (page - 1) * pageLimit}</div>
                </div>
                <div id="actions">
                  {text.annotated ? (
                    <IoCheckmarkCircleSharp
                      id="icon"
                      annotated="true"
                      onClick={() => {
                        dispatch(
                          patchSingleAnnotationState({
                            textId: text._id,
                            value: false,
                          })
                        );
                      }}
                    />
                  ) : (
                    <IoCloseCircle
                      id="icon"
                      onClick={() => {
                        dispatch(
                          patchSingleAnnotationState({
                            textId: text._id,
                            value: true,
                          })
                        );
                      }}
                    />
                  )}
                  {tokenizeTextId === text._id ? (
                    <IoEllipsisVerticalCircleSharp
                      id="icon-tokenize"
                      active="true"
                      title="Go to replacement view"
                      onClick={() =>
                        dispatch(
                          setTokenizeTextId(
                            tokenizeTextId === text._id ? null : text._id
                          )
                        )
                      }
                    />
                  ) : (
                    <RiEditCircleFill
                      id="icon-tokenize"
                      title="Go to tokenization view"
                      onClick={() =>
                        dispatch(
                          setTokenizeTextId(
                            tokenizeTextId === text._id ? null : text._id
                          )
                        )
                      }
                    />
                  )}
                </div>
                <div id="row" key={id} annotated={text.annotated && "true"}>
                  <div id="text-column">
                    {tokenizeTextId === text._id ? (
                      <Tokenize tokenIds={text.token_ids} textId={text._id} />
                    ) : (
                      <Text tokenIds={text.token_ids} textId={text._id} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  } else if (tokensStatus === "failed") {
    textsContent = <div>{textsError}</div>;
  }

  return (
    <>
      {showToast && <ContextToast />}
      <Container fluid>
        <Row>
          <Col id="sidebar-wrapper">
            <Sidebar />
          </Col>
          <Col>
            {tokensStatus === "loading" ? (
              <div
                style={{
                  textAlign: "center",
                }}
              >
                <Spinner animation="border" style={{ marginTop: "50vh" }} />
              </div>
            ) : (
              <>
                <SaveButton />
                {textsContent}
                <Paginator />
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};
