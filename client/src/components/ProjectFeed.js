import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { createUseStyles } from 'react-jss';
import { Spinner, Button, Dropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import BrandImage from './images/logo_transparent_white.png';


import ProjectList from './ProjectList'
import UploadModal from './modals/UploadModal'
import DeleteProjectModal from './modals/DeleteProjectModal'
import AnnotateBeginModal from './modals/AnnotateBeginModal'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        minHeight: '100%'
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
    brandLogo: {
        height: '3em',
        // transform: 'scale(0.25, 0.25)',
        padding: '0.25em',
        marginLeft: '1em',
        cursor: 'pointer'
    }
})

export default function ProjectFeed({token, setToken}) {
    const classes = useStyles();
    const history = useHistory();

    const [projects, setProjects] = useState();
    const [projectsLoaded, setProjectsLoaded] = useState(false);
    const [selectedProject, setSelectedProject] = useState();

    const [showAnnotate, setShowAnnotate] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showProjectDelete, setShowProjectDelete] = useState(false);

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null)
        history.push("/");
    }

    useEffect(() => {
        // Fetches project on page load and when upload modal is interacted with.
        const fetchProjects = async () => {
            const response = await axios.post('/api/project/feed', { jwt_token: JSON.parse(localStorage.getItem('token')) });
            if (response.status === 200){
                // console.log('projects', response.data);
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

        <div className={classes.container}>
            <div className={classes.header}>
                <img
                    className={classes.brandLogo}
                    src={BrandImage}
                    onClick={() => history.push("/")}
                    alt="lexiclean logo"
                />
                <div style={{marginRight: '1em', padding: '0.25em'}}>
                    <Dropdown>
                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                            Menu
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setShowUpload(true)}>New Project</Dropdown.Item>
                            <Dropdown.Item onClick={() => history.push('/')}>Home</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
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
                    <p>No projects</p>
                    <Button variant="dark" onClick={() => setShowUpload(true)}>Create Project</Button>
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
