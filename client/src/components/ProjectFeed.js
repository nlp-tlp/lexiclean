import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { createUseStyles } from 'react-jss';
import { Spinner, Button } from 'react-bootstrap';

import ProjectList from './ProjectList'
import UploadModal from './modals/UploadModal'
import DeleteProjectModal from './modals/DeleteProjectModal'
import AnnotateBeginModal from './modals/AnnotateBeginModal'

import Logout from './auth/Logout'


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
        marginLeft: '1em',
        backgroundColor: '#8F8F8F',
        border: 'none'
    },
    menu: {
        marginRight: '1em',
        padding: '0.25em',
    },
})

export default function ProjectFeed({token, logout}) {
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
            const response = await axios.post('/api/project/feed', { jwt_token: JSON.parse(localStorage.getItem('token')) });
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
        { showUpload ? <UploadModal showUpload={showUpload} setShowUpload={setShowUpload} /> : null }

        { showProjectDelete ?
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

        <div
            style={{display: 'flex', flexDirection: 'column', height: '80vh', minHeight: '100%'}}
        >
            <div className={classes.header}>
                <button 
                    className={classes.title}
                    onClick={() => window.location.href="/"}
                >
                    Lexiclean
                </button>
                <div className={classes.menu}>
                    <Button variant="light" onClick={() => setShowUpload(true)}>Create Project</Button>
                </div>
                <Logout/>
            </div>

            {
                !projectsLoaded ? 
                <div
                    style={{margin: 'auto', marginTop: '5em'}}
                >
                    <Spinner animation="border" />
                </div>
                : projects.length === 0 ?
                <div
                    style={{margin: 'auto', textAlign: 'center', marginTop: '5em', fontSize: '2em'}}
                >
                        No projects
                </div>
                :
                <ProjectList 
                    projects={projects}
                    setSelectedProject={setSelectedProject}
                    setShowAnnotate={setShowAnnotate}
                    setShowProjectDelete={setShowProjectDelete}
                />
            }
        </div>
        </>
    )
}
