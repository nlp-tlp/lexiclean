import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { Spinner } from "react-bootstrap";
import axios from "../../common/utils/api-interceptor";
import { CgMergeVertical, CgMoreVertical } from "react-icons/cg";

import Text from "./Text";
import Paginator from "../../common/utils/Paginator";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "80%",
    margin: "auto",
    marginTop: '4em',
    userSelect: "none", // Stops text from being selected on click
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1em",
    backgroundColor: "#F2F2F2",
    marginTop: "1em",
    minHeight: "100%",
    maxWidth: "100%",
  },
  textColumn: {
    marginLeft: "1em",
    minHeight: "2em",
    display: "flex",
    width: "90%",
  },
  indexColumn: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    verticalAlign: "middle",
  },
  indexIcon: {
    fontSize: "22px",
    fontWeight: "bold",
    width: "2em",
    height: "2em",
    margin: "auto",
  },
});

export default function AnnotationTable({
  project,
  replacementDict,
  setReplacementDict,
  pageLimit,
  setPageChanged,
  setToastInfo,
  currentTexts,
  setCurrentTexts,
  saveTrigger,
  setSaveTrigger,
  saveReplacementsOnly,
  pageNumber,
  setSavePending,
  schemaTrigger,
  searchTerm,
  setSearchTerm,
}) {
  const classes = useStyles();

  const [loaded, setLoaded] = useState(false);
  const [metaTagSuggestionMap, setMetaTagSuggestionMap] = useState();
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const [bgColourMap, setBgColourMap] = useState();
  const [activeMaps, setActiveMaps] = useState();

  const [paginatorLoaded, setPaginatorLoaded] = useState();
  const [totalPages, setTotalPages] = useState();
  const [page, setPage] = useState(pageNumber);

  // TOKEN SELECT HANDLER
  const [tokenize, setTokenize] = useState();

  // User interaction
  const [changeTrigger, setChangeTrigger] = useState(false);

  useEffect(() => {
    // Updates page status anytime pagination occurs. This updates upstream components.
    setPageChanged(page);
  }, [page]);

  useEffect(() => {
    // Fetch pagination metadata
    const fetchPaginationInfo = async () => {
      if (!paginatorLoaded || pageLimit || searchTerm !== "") {
        const response = await axios.post(
          "/api/text/filter",
          {
            project_id: project._id,
            get_pages: true,
            search_term: searchTerm !== "" ? searchTerm : null,
          },
          { params: { limit: pageLimit } }
        );
        if (response.status === 200) {
          setTotalPages(response.data.totalPages);
          setPaginatorLoaded(true);
        }
      }
    };
    fetchPaginationInfo();
  }, [paginatorLoaded, pageLimit, searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      setLoaded(false);
      setPage(pageNumber);
      const response = await axios.post(
        "/api/text/filter",
        {
          project_id: project._id,
          search_term: searchTerm !== "" ? searchTerm : null,
        },
        { params: { page: page, limit: pageLimit } }
      );
      if (response.status === 200) {
        setCurrentTexts(response.data);
        setLoaded(true);
      }
    };
    fetchData();
  }, [pageLimit, saveTrigger, pageNumber, schemaTrigger, searchTerm]); //page, 

  useEffect(() => {
    const fetchProjectMaps = async () => {
      if (!mapsLoaded && project) {
        const response = await axios.get(`/api/map/${project._id}`);
        if (response.status === 200) {
          setMetaTagSuggestionMap(
            Object.fromEntries(response.data.map_keys.map((key) => [[key], {}]))
          );
          setBgColourMap(response.data.colour_map);
          setActiveMaps(
            Object.keys(response.data.contents).filter(
              (key) => response.data.contents[key].active
            )
          );
          setMapsLoaded(true);
        }
      } else {
        // Triggers when schema is dynamically updated
        const response = await axios.get(`/api/map/${project._id}`);
        if (response.status === 200) {
          // console.log('schema update: map res ->', response.data.colour_map)
          setBgColourMap(response.data.colour_map);
          setActiveMaps(
            Object.keys(response.data.contents).filter(
              (key) => response.data.contents[key].active
            )
          );
          setMapsLoaded(true);
        }
      }
    };
    fetchProjectMaps();
  }, [mapsLoaded, schemaTrigger]);

  useEffect(() => {
    const updateTextAnnotationStates = async () => {
      if (currentTexts) {
        await axios.patch("/api/text/annotations/update", {
          textIds: currentTexts.map((text) => text._id), replacements_only: saveReplacementsOnly
        });
      }
    };
    updateTextAnnotationStates();
    setSaveTrigger(false);
  }, [saveTrigger]); //page, 

  const handleTokenize = (textId) => {
    if (tokenize) {
      setTokenize();
    } else {
      setTokenize(textId);
    }
  };

  return (
    <>
      <div className={classes.container}>
        {!loaded || !mapsLoaded ? (
          <div style={{ margin: "auto", marginTop: "5em" }}>
            <Spinner animation="border" />
          </div>
        ) : (
          currentTexts.map((text, textIndex) => {
            const textProps = {
              project,
              text,
              replacementDict,
              setReplacementDict,
              page,
              metaTagSuggestionMap,
              setMetaTagSuggestionMap,
              bgColourMap,
              tokenize,
              changeTrigger,
              setChangeTrigger,
              setToastInfo,
              saveTrigger,
              activeMaps,
              setSavePending,
              schemaTrigger,
            };

            return (
              <div
                className={classes.row}
                key={textIndex}
                style={{
                  background: text.annotated ? "rgba(153,191,156,0.2)" : null,
                }}
              >
                <div className={classes.indexColumn}>
                  <p className={classes.indexIcon}>
                    {textIndex + 1 + (page - 1) * pageLimit}
                  </p>
                </div>
                <div className={classes.textColumn}>
                  <Text {...textProps} />
                </div>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: "bold",
                    color: "grey",
                  }}
                  onClick={() => handleTokenize(text._id)}
                >
                  {tokenize !== text._id ? (
                    <CgMergeVertical />
                  ) : (
                    <CgMoreVertical />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {loaded ? (
        <Paginator
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          project={project}
        />
      ) : null}
    </>
  );
}
