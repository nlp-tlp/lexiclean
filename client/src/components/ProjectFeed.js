// Need to add 'upload project' button to this page.

import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { createUseStyles } from 'react-jss';
import { Spinner, Button } from 'react-bootstrap';

import ProjectList from './ProjectList'
import Footer from './Footer'

import UploadModal from './modals/UploadModal'
import DeleteProjectModal from './modals/DeleteProjectModal'
import AnnotateBeginModal from './modals/AnnotateBeginModal'

const useStyles = createUseStyles({
    container: {
        paddingTop: '1em',
        paddingBottom: '1em',
        backgroundColor: '#8F8F8F',
        maxWidth: '100%'
    },
    header: {
        paddingTop: '0.5em',
        paddingBottom: '0.5em',
        backgroundColor: '#8F8F8F',
        maxWidth: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px #D9D9D9 solid'
    },
    title: {
        fontWeight: 'bolder',
        fontSize: '1.5em',
        textAlign: 'left',
        fontFamily: 'sans-serif',
        color: '#F8F9FA',
        padding: '0.25em',
        borderRadius: '0.5em',
        marginLeft: '1em',
    },
    menu: {
        marginRight: '1em',
        padding: '0.25em',
    },
})

export default function ProjectFeed() {
    const classes = useStyles();

    const [projects, setProjects] = useState();
    const [projectsLoaded, setProjectsLoaded] = useState(false);
    const [selectedProject, setSelectedProject] = useState();

    const [showAnnotate, setShowAnnotate] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showProjectDelete, setShowProjectDelete] = useState(false);

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
    }, [projectsLoaded, showUpload, showProjectDelete])

    return (
        <>

        {
            showUpload ?
            <UploadModal
                showUpload={showUpload}
                setShowUpload={setShowUpload}
            />
            : null
        }

        {
            showProjectDelete ?
            <DeleteProjectModal
                showProjectDelete={showProjectDelete}
                setShowProjectDelete={setShowProjectDelete}
                selectedProject={selectedProject}
            />
            : null
        }

        { showAnnotate ? 
            <AnnotateBeginModal
                showAnnotate={showAnnotate}
                setShowAnnotate={setShowAnnotate}
                selectedProject={selectedProject}
            />
            : null
        }

        <div style={{display: 'flex', flexDirection: 'column', height: '1000px', minHeight: '100%'}}> 

            <div className={classes.header}>
                <div className={classes.title}>
                Lexiclean
                </div>
                <div className={classes.menu}>
                    <Button variant="light" onClick={() => setShowUpload(true)}>Create Project</Button>
                </div>
            </div>

            {
                !projectsLoaded ? 
                <div style={{margin: 'auto', marginTop: '5em'}}>
                <Spinner animation="border" />
                </div>
                : projects.length === 0 ?
                <div style={{margin: 'auto', textAlign: 'center', marginTop: '5em', fontSize: '2em'}}>No projects</div>
                :
                <ProjectList 
                projects={projects}
                setSelectedProject={setSelectedProject}
                setShowAnnotate={setShowAnnotate}
                setShowProjectDelete={setShowProjectDelete}
                />
            }

            <Footer />
        </div>
        </>
    )
}
