import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import axios from 'axios';
import { Spinner, Navbar } from 'react-bootstrap';

import AnnotationTable from './AnnotationTable'
import Header from './header/Header'
import ContextToast from './utils/ContextToast';

import DownloadModal from './modals/DownloadModal'
import ProgressModal from './modals/ProgressModal'
import SettingsModal from './modals/SettingsModal'
import OverviewModal from './modals/OverviewModal'
import LegendModal from './modals/LegendModal'
import ModifySchemaModal from './modals/ModifySchemaModal'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
    }
})

const PAGE_LIMIT = 10;

export default function Project() {
    const classes = useStyles();
    const { projectId } = useParams();
    let { pageNumber } = useParams();
    pageNumber = parseInt(pageNumber);

    const [replacementDict, setReplacementDict] = useState({});
    const [currentTexts, setCurrentTexts] = useState();
    const [saveTrigger, setSaveTrigger] = useState(false);
    const [savePending, setSavePending] = useState(false);
    const [schemaTrigger, setSchemaTrigger] = useState(false);

    const [showDownload, setShowDownload] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showOverview, setShowOverview] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [showModifySchema, setShowModifySchema] = useState(false);

    const [project, setProject] = useState({});
    const [projectLoaded, setProjectLoaded] = useState(false);
    const [pageLimit, setPageLimit] = useState(localStorage.getItem('pageLimit') ? localStorage.getItem('pageLimit') : PAGE_LIMIT)
    const [pageChanged, setPageChanged] = useState(); // uses page number to update state...

    const [toastInfo, setToastInfo] = useState();
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (toastInfo){
            //console.log('toast!')
            setShowToast(true);
        }
    }, [toastInfo])

    useEffect(() => {
        const fetchProject = async () => {
            const response = await axios.get(`/api/project/${projectId}`);
            if (response.status === 200){
                //console.log('project details', response.data);
                setProject(response.data);
                setProjectLoaded(true);
            }
        }
        fetchProject();
    }, [projectLoaded])

    useEffect(() => {
        localStorage.setItem('replacements', JSON.stringify(replacementDict))
    }, [replacementDict])

    const headerProps = {
        project,
        currentTexts,
        setShowDownload,
        setShowProgress,
        setShowSettings,
        setShowOverview,
        setShowLegend,
        setShowModifySchema,
        pageChanged,
        saveTrigger,
        setSaveTrigger,
        savePending,
        setSavePending
    }

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
        pageNumber,
        setSavePending,
        schemaTrigger
    }

    const modifySchemaProps = {
        showModifySchema,
        setShowModifySchema,
        project,
        schemaTrigger,
        setSchemaTrigger
    }

    return (
        <>
        { (showLegend && project) ? <LegendModal showLegend={showLegend} setShowLegend={setShowLegend} project={project}/> : null }
        { (showOverview && project) ? <OverviewModal showOverview={showOverview} setShowOverview={setShowOverview} projectId={project._id} pageLimit={pageLimit}/> : null }
        { showDownload ? <DownloadModal showDownload={showDownload} setShowDownload={setShowDownload} project={project}/> : null }
        { showProgress ? <ProgressModal showProgress={showProgress} setShowProgress={setShowProgress}/> : null }
        { showSettings ? <SettingsModal showSettings={showSettings} setShowSettings={setShowSettings} pageLimit={pageLimit} setPageLimit={setPageLimit} /> : null }
        { showModifySchema ? <ModifySchemaModal {...modifySchemaProps} /> : null}
        
        { toastInfo ? <ContextToast showToast={showToast} setShowToast={setShowToast} toastInfo={toastInfo}/> : null }

        <div className={classes.container} tabIndex="0">
            <Header {...headerProps} />
            { 
                !projectLoaded 
                ?
                <Spinner animation="border"/>
                :
                <AnnotationTable {...annotationTableProps} />
            }
        </div>

        <Navbar bg="light" fixed="bottom">
            <Navbar.Text className="m-auto">
                © UWA NLP-TLP Group 2021.
            </Navbar.Text>
        </Navbar>

        </>
    )
}
