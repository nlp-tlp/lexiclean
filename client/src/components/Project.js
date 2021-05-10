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


export default function Project() {
    const { projectId } = useParams();

    const [replacementDict, setReplacementDict] = useState({});

    const [showDownload, setShowDownload] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [saved, setSaved] = useState(false)

    const [project, setProject] = useState();
    const [projectLoaded, setProjectLoaded] = useState(false);

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
        { showDownload ? <DownloadModal showDownload={showDownload} setShowDownload={setShowDownload}/> : null }
        { showProgress ? <ProgressModal showProgress={showProgress} setShowProgress={setShowProgress}/> : null }

        
        <Header
            projectName={project ? project.name : ''}
            replacementDict={replacementDict}
            setShowDownload={setShowDownload}
            setShowProgress={setShowProgress}
            setSaved={setSaved}
        />

        {/* // TODO: Need to add filter/sort here... */}
        {
            !projectLoaded ? 
                <Spinner animation="border" />
            :
                <AnnotationTable
                    project={project}
                    replacementDict={replacementDict}
                    setReplacementDict={setReplacementDict}
                    saved={saved}
                    setSaved={setSaved}
                />
        }

        <Footer />
        </>
    )
}
