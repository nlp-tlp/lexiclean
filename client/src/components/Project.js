import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Spinner, Toast } from 'react-bootstrap';

import AnnotationTable from './AnnotationTable'
import Header from './header/Header'

import DownloadModal from './modals/DownloadModal'
import ProgressModal from './modals/ProgressModal'
import SettingsModal from './modals/SettingsModal'
import OverviewModal from './modals/OverviewModal'
import LegendModal from './modals/LegendModal'
import ModifySchemaModal from './modals/ModifySchemaModal'


const PAGE_LIMIT = 10;

export default function Project() {
    const { projectId } = useParams();

    const [replacementDict, setReplacementDict] = useState({});

    const [showDownload, setShowDownload] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showOverview, setShowOverview] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [showModifySchema, setShowModifySchema] = useState(false);


    const [saved, setSaved] = useState(false)

    const [project, setProject] = useState({});
    const [projectLoaded, setProjectLoaded] = useState(false);
    const [pageLimit, setPageLimit] = useState(localStorage.getItem('pageLimit') ? localStorage.getItem('pageLimit') : PAGE_LIMIT)
    const [pageChanged, setPageChanged] = useState(); // uses page number to update state...

    // Toast
    const [toastInfo, setToastInfo] = useState();
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (toastInfo){
            console.log('toast!')
            setShowToast(true);
        }
    }, [toastInfo])

    useEffect(() => {
        const fetchProject = async () => {
            const response = await axios.get(`/api/project/${projectId}`);
            if (response.status === 200){
                console.log('project details', response.data);
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
        replacementDict,
        setShowDownload,
        setShowProgress,
        setShowSettings,
        setShowOverview,
        setShowLegend,
        setShowModifySchema,
        setSaved,
        pageChanged
    }

    const annotationTableProps = {
        project,
        replacementDict,
        setReplacementDict,
        pageLimit,
        saved,
        setSaved,
        setPageChanged,
        setToastInfo
    }


    return (
        <>
        { (showLegend && project) ? <LegendModal showLegend={showLegend} setShowLegend={setShowLegend} project={project}/> : null }
        { (showOverview && project) ? <OverviewModal showOverview={showOverview} setShowOverview={setShowOverview} projectId={project._id} pageLimit={pageLimit}/> : null }
        { showDownload ? <DownloadModal showDownload={showDownload} setShowDownload={setShowDownload} project={project}/> : null }
        { showProgress ? <ProgressModal showProgress={showProgress} setShowProgress={setShowProgress}/> : null }
        { showSettings ? <SettingsModal showSettings={showSettings} setShowSettings={setShowSettings} pageLimit={pageLimit} setPageLimit={setPageLimit} /> : null }
        { showModifySchema ? <ModifySchemaModal showModifySchema={showModifySchema} setShowModifySchema={setShowModifySchema} project={project}/> : null}
        
        {
            toastInfo ?
            <>
            <Toast
                show={showToast}
                onClose={() => setShowToast(false)}
                style={{
                    position: 'absolute',
                    top: 75,
                    right: 50,
                    width: 200,
                    zIndex: 1000
                }}
                delay={3000}
                autohide
            >
                <Toast.Header>
                    <strong className="mr-auto">{toastInfo.type === 'replacement' ? 'Replacement' : 'Meta Tag' }</strong>
                    <small>just now</small>
                </Toast.Header>
                <Toast.Body>
                    {
                        toastInfo.type === 'replacement' ?
                        <>
                        updated <strong>{ toastInfo.content.original }</strong> to <strong>{ toastInfo.content.replacement}</strong> 
                        {' '}
                        <strong>{ toastInfo.content.count }</strong> times
                        </>
                        :
                        <>
                        applied <strong>{ toastInfo.content.metaTag }</strong> : <strong>{ toastInfo.content.metaTagValue ? 'true' : 'false' }</strong>
                        {' '}
                        to <strong>{ toastInfo.content.original }</strong> <strong>{ toastInfo.content.count }</strong> times
                        </>
                    }
                </Toast.Body>
            </Toast>
            </>
        : null

        }

        <div
            style={{display: 'flex', flexDirection: 'column', minHeight: '100%'}}
            tabIndex="0"
        >
            <Header
                {...headerProps}
            />
            
            <div
                className="content"
                style={{flex: '1 0 auto'}}
            >
                { !projectLoaded 
                    ?
                    <Spinner animation="border" />
                    :
                    <AnnotationTable
                        {...annotationTableProps}
                    />
                }
            </div>

        </div>
        </>
    )
}
