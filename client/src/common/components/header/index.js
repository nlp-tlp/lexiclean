import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom'
import { createUseStyles } from 'react-jss';
import { Container, Row, Col, Spinner, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { MdBubbleChart, MdSave } from 'react-icons/md'
import { IoInformationCircleSharp } from 'react-icons/io5';

const useStyles = createUseStyles({
    header: {
        maxWidth: '100%',
        width: "100vw!important",
        position: 'sticky',
        top: '0',
    },
    metricsContainer: {
        display: 'inline-block',
        backgroundColor: '#A2D2D2',
        margin: 'auto',
        padding: '0.2em 0.5em 0em 0.5em',
        borderRadius: '0.5em'
    },
    menu: {
        marginRight: '1em',
        padding: '0.25em',
        display: 'flex'
    },
    save: {
        marginLeft: '0.25em',
        fontSize: '36px',
        color: 'grey',
        cursor: 'pointer',
    },
})

export default function Header({project,
                                currentTexts,
                                setShowDownload,
                                setShowProgress,
                                setShowSettings,
                                setShowOverview,
                                setShowLegend,
                                setShowModifySchema,
                                setShowHelp,
                                pageChanged,
                                saveTrigger,
                                setSaveTrigger,
                                savePending,
                                setSavePending
                            }) {
                                
    const history = useHistory();
    const classes = useStyles();

    const username = localStorage.getItem('username');

    const [progress, setProgress] = useState();
    const [currentVocabSize, setCurrentVocabSize] = useState();
    const [currentOOVTokenCount, setCurrentOOVTokenCount] = useState();

    useEffect(() => {
        const fetchProgressInfo = async () => {
            // console.log('fetching progress data')
            if (project._id) {
                const response = await axios.get(`/api/project/counts/${project._id}`, {headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('token'))}});
                if (response.status === 200){
                    setProgress(response.data.text);
                    setCurrentVocabSize(response.data.token.vocab_size);
                    setCurrentOOVTokenCount(response.data.token.oov_tokens);
                } 
            }   
        }
        fetchProgressInfo();
    }, [project, pageChanged, saveTrigger])


    const savePageResults = async () => {
        if (project._id){
            const response = await axios.patch(`/api/token/suggest/accept/${project._id}`, { textIds: currentTexts.map(text => text._id) })
            if (response.status === 200){
                setSavePending(false);
                setSaveTrigger(!saveTrigger);
            }
        }
    }

    return (
        <>
        <Container className={classes.header}>
            <Navbar collapseOnSelect expand="lg" bg="light" variant="light" sticky="top">
                <Navbar.Brand href="/">
                    <MdBubbleChart style={{fontSize: '40px'}}/>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto" style={{fontSize: '28px', fontWeight: 'bold'}}>
                        { project.name }
                    </Nav>
                    <Nav>
                        <NavDropdown title="Menu" alignRight>
                            <NavDropdown.Item onClick={() => setShowLegend(true)}>Legend</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => setShowDownload(true)}>Download Results</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => setShowModifySchema(true)}>Modify Schema</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => setShowSettings(true)}>Settings</NavDropdown.Item>
                            <NavDropdown.Divider/>
                            <NavDropdown.Item onClick={() => history.push('/feed')}>Return To Feed</NavDropdown.Item>
                            <NavDropdown.Item disabled>Signed in as: {username}</NavDropdown.Item>
                        </NavDropdown>
                        <IoInformationCircleSharp style={{margin: 'auto', fontSize: '1.5em'}} onClick={() => setShowHelp(true)}/>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <Row style={{backgroundColor: 'white', opacity: '0.9'}} >
                <Col md="2" className="text-left">
                    {
                        progress && project && currentVocabSize ?
                        <p
                            className={classes.save}
                            onClick={() => savePageResults()}
                            title='Click to save the current pages suggestions'
                        >
                            <MdSave style={{color: savePending ? 'rgb(107, 176, 191)' : ''}}/>
                        </p>
                        : null
                    }
                </Col>
            {
                progress && project && currentVocabSize ?
                    <Col md="8" className="text-center">
                        <Row style={{marginTop: '0.5em', backgroundColor: 'white', opacity: '1'}}>
                            <Col>
                                <div style={{display: 'flex', flexDirection: 'column', padding: '0em', width: '100%'}}>
                                    <p style={{margin: '0em', fontSize: '1.5em', fontWeight: 'bolder'}}>
                                        {progress.annotated} / {progress.total}
                                    </p>
                                    <p
                                        style={{fontSize: '0.75em', fontWeight: 'bold'}}
                                        title='Texts that have had classifications or replacements.'
                                    >
                                    Texts Annotated
                                    </p>
                                </div>
                            </Col>
                            <Col>
                                <div style={{display: 'flex', flexDirection: 'column', padding: '0em', width: '100%'}}>
                                    <p style={{margin: '0em', fontSize: '1.5em', fontWeight: 'bolder'}}>
                                        {currentVocabSize} / {project.metrics.starting_vocab_size}
                                    </p>
                                    <p
                                        style={{fontSize: '0.75em', fontWeight: 'bold'}}
                                        title='Comparison between of current vocabulary and starting vocabulary'
                                    >
                                        Current Vocab / Starting Vocab
                                    </p>
                                </div>
                            </Col>
                            <Col>
                                <div style={{display: 'flex', flexDirection: 'column', padding: '0em', width: '100%'}}>
                                    <p style={{margin: '0em', fontSize: '1.5em', fontWeight: 'bolder'}}>
                                        {project.metrics.starting_oov_token_count - currentOOVTokenCount} / {project.metrics.starting_oov_token_count}
                                    </p>
                                    <p
                                        style={{fontSize: '0.75em', fontWeight: 'bold'}}
                                        title='All tokens replaced or classified with meta-tags are captured'
                                    >
                                        OOV Corrected
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                :
                <Col md="8" className="text-center"><Spinner animation="border" size="sm" variant="light"/></Col>
            }
                <Col md="2"></Col>
            </Row>
        </Container>
        </>
    )
}
