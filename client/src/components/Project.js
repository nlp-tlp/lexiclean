import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

import AnnotationTable from './AnnotationTable'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

import DownloadModal from './modals/DownloadModal'
import ProgressModal from './modals/ProgressModal'
import SettingsModal from './modals/SettingsModal'
import OverviewModal from './modals/OverviewModal'


const PAGE_LIMIT = 10;

export default function Project() {
    const { projectId } = useParams();

    const [replacementDict, setReplacementDict] = useState({});

    const [showDownload, setShowDownload] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showOverview, setShowOverview] = useState(false);


    const [saved, setSaved] = useState(false)

    const [project, setProject] = useState();
    const [projectLoaded, setProjectLoaded] = useState(false);
    const [pageLimit, setPageLimit] = useState(PAGE_LIMIT)
    const [pageChanged, setPageChanged] = useState(); // uses page number to update state...

    useEffect(() => {
        // Fetches project
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

    return (
        <>
        { (showOverview && project) ? <OverviewModal showOverview={showOverview} setShowOverview={setShowOverview} projectId={project._id} pageLimit={pageLimit}/> : null }
        { showDownload ? <DownloadModal showDownload={showDownload} setShowDownload={setShowDownload}/> : null }
        { showProgress ? <ProgressModal showProgress={showProgress} setShowProgress={setShowProgress}/> : null }
        { showSettings ? <SettingsModal showSettings={showSettings} setShowSettings={setShowSettings} pageLimit={pageLimit} setPageLimit={setPageLimit} /> : null }

        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <Header
                project={project ? project : {}}
                replacementDict={replacementDict}
                setShowDownload={setShowDownload}
                setShowProgress={setShowProgress}
                setShowSettings={setShowSettings}
                setShowOverview={setShowOverview}
                setSaved={setSaved}
                pageChanged={pageChanged}
                />

            {/* // TODO: Need to add filter/sort here... */}
            <div className="content" style={{flex: '1 0 auto'}}>
            {
                !projectLoaded ? 
                <Spinner animation="border" />
                :
                <AnnotationTable
                project={project}
                replacementDict={replacementDict}
                setReplacementDict={setReplacementDict}
                pageLimit={pageLimit}
                saved={saved}
                setSaved={setSaved}
                setPageChanged={setPageChanged}
                />
            }   
            </div>
            <div style={{flexShrink: '0'}}>
                <Footer />

            </div>
        </div>
        </>
    )
}
