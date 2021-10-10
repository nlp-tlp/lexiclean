import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../common/utils/api-interceptor";
import history from "../common/utils/history";

import { Spinner, Container, Row, Col, Button } from "react-bootstrap";

import Sidebar from "../common/components/Sidebar";
import SaveButton from "./components/SaveButton";

import AnnotationTable from "./components/AnnotationTable";
import ContextToast from "../common/utils/ContextToast";

import DownloadModal from "./modals/DownloadModal";
import ProgressModal from "./modals/ProgressModal";
import SettingsModal from "./modals/SettingsModal";
import OverviewModal from "./modals/OverviewModal";
import LegendModal from "./modals/LegendModal";
import ModifySchemaModal from "./modals/ModifySchemaModal";
import HelpModal from "./modals/HelpModal";

const PAGE_LIMIT = 10;

export default function Project() {
  const { projectId } = useParams();
  let { pageNumber } = useParams();
  pageNumber = parseInt(pageNumber);

  const [replacementDict, setReplacementDict] = useState({});
  const [currentTexts, setCurrentTexts] = useState();
  const [saveTrigger, setSaveTrigger] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [saveReplacementsOnly, setSaveReplacementsOnly] = useState(false);
  const [schemaTrigger, setSchemaTrigger] = useState(false);

  const [showDownload, setShowDownload] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showModifySchema, setShowModifySchema] = useState(false);

  const [showHelp, setShowHelp] = useState(false);

  const [project, setProject] = useState({});
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [pageLimit, setPageLimit] = useState(
    localStorage.getItem("pageLimit")
      ? localStorage.getItem("pageLimit")
      : PAGE_LIMIT
  );
  const [pageChanged, setPageChanged] = useState(); // uses page number to update state...

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [tempValue, setTempValue] = useState(searchTerm);

  const [toastInfo, setToastInfo] = useState();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (toastInfo) {
      //console.log('toast!')
      setShowToast(true);
    }
  }, [toastInfo]);

  useEffect(() => {
    const fetchProject = async () => {
      await axios
        .get(`/api/project/${projectId}`)
        .then((response) => {
          if (response.status === 200) {
            setProject(response.data);
            setProjectLoaded(true);
          }
        })
        .catch((error) => {
          if (error.response.status === 401 || 403) {
            console.log("unauthorized");
            history.push("/unauthorized");
          }
        });
    };
    fetchProject();
  }, [projectLoaded]);

  useEffect(() => {
    localStorage.setItem("replacements", JSON.stringify(replacementDict));
  }, [replacementDict]);

  const annotationTableProps = {
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
  };

  const modifySchemaProps = {
    showModifySchema,
    setShowModifySchema,
    project,
    schemaTrigger,
    setSchemaTrigger,
  };

  const sidebarProps = {
    project,
    pageChanged,
    saveTrigger,
    currentTexts,
    setSaveTrigger,
    tempValue,
    setTempValue,
    searchTerm,
    setSearchTerm,
    setShowDownload,
    setShowProgress,
    setShowSettings,
    setShowOverview,
    setShowLegend,
    setShowModifySchema,
    setShowHelp,
  };

  const saveBtnProps = {
    project,
    currentTexts,
    saveTrigger,
    setSaveTrigger,
    savePending,
    setSavePending,
    setSaveReplacementsOnly
  };

  return (
    <>
      {showLegend && project ? (
        <LegendModal
          showLegend={showLegend}
          setShowLegend={setShowLegend}
          project={project}
        />
      ) : null}
      {showOverview && project ? (
        <OverviewModal
          showOverview={showOverview}
          setShowOverview={setShowOverview}
          projectId={project._id}
          pageLimit={pageLimit}
        />
      ) : null}
      {showDownload ? (
        <DownloadModal
          showDownload={showDownload}
          setShowDownload={setShowDownload}
          project={project}
        />
      ) : null}
      {showProgress ? (
        <ProgressModal
          showProgress={showProgress}
          setShowProgress={setShowProgress}
        />
      ) : null}
      {showSettings ? (
        <SettingsModal
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          pageLimit={pageLimit}
          setPageLimit={setPageLimit}
        />
      ) : null}
      {showModifySchema ? <ModifySchemaModal {...modifySchemaProps} /> : null}
      {showHelp ? (
        <HelpModal showHelp={showHelp} setShowHelp={setShowHelp} />
      ) : null}

      {toastInfo ? (
        <ContextToast
          showToast={showToast}
          setShowToast={setShowToast}
          toastInfo={toastInfo}
        />
      ) : null}

      <Container fluid>
        <Row>
          <Col id="sidebar-wrapper">
            <Sidebar {...sidebarProps} />
          </Col>
          <Col id="page-content-wrapper">
            {!projectLoaded ? (
              <Spinner animation="border" />
            ) : (
              <>
                <SaveButton {...saveBtnProps} />
                <AnnotationTable {...annotationTableProps} />
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}
