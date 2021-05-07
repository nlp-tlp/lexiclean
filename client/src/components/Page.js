import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Spinner, Button } from 'react-bootstrap';


import AnnotationTable from './AnnotationTable'
import ProjectList from './ProjectList'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

import UploadModal from './modals/UploadModal'
import DownloadModal from './modals/DownloadModal'
import ProgressModal from './modals/ProgressModal'
import AnnotateBeginModal from './modals/AnnotateBeginModal'



const texts = ['hello world', 'hello 123 world', 'goodbye tyler world', 'goodbye world'];
const tokens_en = ['hello', 'goodbye'];
const tokens_ds = ['123', 'tyler'];

export default function Page() {

    const [lexNormDict, setLexNormDict] = useState({});
    const textCount = texts.length;

    const [showUpload, setShowUpload] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [showAnnotate, setShowAnnotate] = useState(false);
    
    const [projects, setProjects] = useState();
    const [projectsLoaded, setProjectsLoaded] = useState(false);
    const [selectedProject, setSelectedProject] = useState();
    const [loadAnnotationView, setLoadAnnotationView] = useState(false);

    useEffect(() => {
        // Fetches project on page load and when upload modal is interacted with.
        const fetchProjects = async () => {
            const response = await axios.get('/api/project/');
            if (response.status === 200){
                console.log('projects', response.data);
                setProjects(response.data);
                setProjectsLoaded(true);
            }
        }
        fetchProjects();
    }, [projectsLoaded, showUpload])

    return (
        <>
        
        { showUpload ? <UploadModal showUpload={showUpload} setShowUpload={setShowUpload}/> : null }
        { showDownload ? <DownloadModal showDownload={showDownload} setShowDownload={setShowDownload}/> : null }
        { showProgress ? <ProgressModal showProgress={showProgress} setShowProgress={setShowProgress}/> : null }
        { showAnnotate ? <AnnotateBeginModal showAnnotate={showAnnotate} setShowAnnotate={setShowAnnotate} setLoadAnnotationView={setLoadAnnotationView}/> : null }

        
        <Header
            textCount={textCount}
            lexNormDict={lexNormDict}
            setShowUpload={setShowUpload}
            setShowDownload={setShowDownload}
            setShowProgress={setShowProgress}
        />

        {/* // TODO: Need to add filter/sort here... */}
        {
            !projectsLoaded ? 
                <Spinner animation="border" />
            : 
            !loadAnnotationView ?
            <ProjectList 
                projects={projects}
                setSelectedProject={setSelectedProject}
                setShowAnnotate={setShowAnnotate}
            />
            :
                <AnnotationTable
                    project={selectedProject}
                    texts={texts}
                    tokens_en={tokens_en}
                    tokens_ds={tokens_ds}
                    lexNormDict={lexNormDict}
                    setLexNormDict={setLexNormDict}
                />


        }

        <Footer />
        </>
    )
}
