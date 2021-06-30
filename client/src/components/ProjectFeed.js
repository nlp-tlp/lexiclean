import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { createUseStyles } from 'react-jss';
import { Spinner, Button, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { MdBubbleChart } from 'react-icons/md';

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

        <Navbar collapseOnSelect expand="md" bg="light" variant="light">
            <Navbar.Brand href="/">
                <MdBubbleChart style={{fontSize: '40px'}}/>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                </Nav>
                <Nav>
                <NavDropdown title="Menu" alignRight>
                    <NavDropdown.Item onClick={() => setShowUpload(true)}>New Project</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => history.push('/')}>Home</NavDropdown.Item>
                    <NavDropdown.Divider/>
                    <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                    <NavDropdown.Item disabled>
                        Signed in as: Name
                    </NavDropdown.Item>
                </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Navbar>

        <div className={classes.container}>
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
                    <Button variant="dark" size="lg" onClick={() => setShowUpload(true)}>Create Project</Button>
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

        <Navbar bg="light" fixed="bottom">
            <Navbar.Text className="m-auto">
                © UWA NLP-TLP Group 2021.
            </Navbar.Text>
        </Navbar>
        </>
    )
}
