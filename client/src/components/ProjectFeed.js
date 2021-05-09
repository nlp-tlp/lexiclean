// Need to add 'upload project' button to this page.

import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { createUseStyles } from 'react-jss';
import { Spinner, Button, Container, Row, Col } from 'react-bootstrap';

import ProjectList from './ProjectList'
import Footer from './Footer'

import UploadModal from './modals/UploadModal'
import DeleteProjectModal from './modals/DeleteProjectModal'
import AnnotateBeginModal from './modals/AnnotateBeginModal'

const useStyles = createUseStyles({
    container: {
        paddingTop: '1em',
        paddingBottom: '1em',
        backgroundColor: '#D9D9D9',
        maxWidth: '100%'
    },
    title: {
        fontWeight: 'bolder',
        fontSize: '2em',
        textAlign: 'center'
        
    }
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

        <Container as="div" className={classes.container}>
            <Row className="align-items-center">
                <Col>
                    <Button variant="light" onClick={() => setShowUpload(true)}>Start New Project</Button>
                </Col>
                <Col xs={8} className={classes.title}>Lexnorm Annotator</Col>
                <Col>
                </Col>
            </Row>
        </Container>

        {
            !projectsLoaded ? 
                <Spinner animation="border" />
            : 
            <ProjectList 
                projects={projects}
                setSelectedProject={setSelectedProject}
                setShowAnnotate={setShowAnnotate}
                setShowProjectDelete={setShowProjectDelete}
            />
        }

        <Footer />
        </>
    )
}
