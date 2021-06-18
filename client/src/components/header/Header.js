import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom'
import { createUseStyles } from 'react-jss';
import { Dropdown, Container, Row, Col, Spinner, Card } from 'react-bootstrap';
import { MdSave } from 'react-icons/md'

const useStyles = createUseStyles({
    header: {
        maxWidth: '100%',
        position: 'sticky',
        top: '0',
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
        display: 'flex',
    },
    save: {
        marginLeft: '0.25em',
        fontSize: '36px',
        color: 'grey',
        cursor: 'pointer',
    },
})

export default function Header({project,
                                replacementDict,
                                setShowDownload,
                                setShowProgress,
                                setShowSettings,
                                setShowOverview,
                                setShowLegend,
                                setShowModifySchema,
                                setSaved,
                                pageChanged
                            }) {
                                
    const history = useHistory();
    const classes = useStyles();

    const [progress, setProgress] = useState();
    const [currentVocabSize, setCurrentVocabSize] = useState();
    const [currentOOVTokenCount, setCurrentOOVTokenCount] = useState();

    const changeCount = Object.keys(replacementDict).map(textIndex => Object.keys(replacementDict[textIndex]).length).reduce((a, b) => a + b, 0);
    const showSaveBtn = Object.keys(replacementDict).length > 0;

    useEffect(() => {
        const fetchProgressInfo = async () => {
            console.log('fetching progress data')
            if (project._id) {
                const response = await axios.get(`/api/text/progress/${project._id}`)
                if (response.status === 200){
                    setProgress(response.data);
                    console.log(response.data)
                }

                const countResponse = await axios.get(`/api/project/token-count/${project._id}`);
                if (countResponse){
                    setCurrentVocabSize(countResponse.data.vocab_size);
                    setCurrentOOVTokenCount(countResponse.data.oov_tokens);
                    console.log('count response', countResponse.data);
                } 
            }   
        }
        fetchProgressInfo();
    }, [project, pageChanged])


    return (
        <Container className={classes.header}>
            <Row
                className="justify-content-md-center"
                style={{ paddingTop: '0.5em', paddingBottom: '0.5em', backgroundColor: '#8F8F8F', borderBottom: '2px #D9D9D9 solid' }}
            >
                <Col md="2" style={{textAlign: 'center'}}>
                    <p className={classes.title}>Lexiclean</p>
                </Col>
                <Col md="8">
                    <p className="text-center" style={{fontSize: '2em', color: '#F8F9FA', fontWeight: 'bolder'}}>
                        {project.name}
                    </p>
                </Col>
                <Col md="2">
                    <div className={classes.menu}>
                        <Dropdown>
                            <Dropdown.Toggle variant="light" id="dropdown-basic">
                                Menu
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {/* <Dropdown.Item onClick={() => setShowOverview(true)}>Overview</Dropdown.Item> */}
                                <Dropdown.Item onClick={() => setShowLegend(true)}>Legend</Dropdown.Item>
                                <Dropdown.Item onClick={() => setShowDownload(true)}>Download Results</Dropdown.Item>
                                {/* <Dropdown.Item onClick={() => setShowProgress(true)}>Review Progress</Dropdown.Item> */}
                                <Dropdown.Item onClick={() => setShowModifySchema(true)}>Modify Schema</Dropdown.Item>
                                <Dropdown.Item onClick={() => setShowSettings(true)}>Settings</Dropdown.Item>
                                <Dropdown.Item onClick={() => history.push('/')}>Home</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Col>
            </Row>
            <Row
                style={{backgroundColor: 'white', opacity: '0.9'}}
            >
                <Col md="3" className="text-left">
                    <p
                        className={classes.save}
                        onClick={() => setSaved(true)}
                        title={`${changeCount} changes waiting`}
                    >
                        <MdSave/>
                    </p>
                </Col>
            {
                progress && project && currentVocabSize ?
                    <Col md="6" className="text-center">
                        <Row style={{marginTop: '0.5em', backgroundColor: 'white', opacity: '1'}}>
                            <Col>
                                <div style={{display: 'flex', flexDirection: 'column', padding: '0em', width: '100%'}}>
                                    <p style={{margin: '0em', fontSize: '1.5em', fontWeight: 'bolder'}}>
                                    {progress.annotated} / {progress.total}
                                    </p>
                                    <p style={{fontSize: '0.75em', fontWeight: 'bold'}}>
                                    Docs Annotated
                                    </p>
                                </div>
                            </Col>
                            <Col>
                                <div style={{display: 'flex', flexDirection: 'column', padding: '0em', width: '100%'}}>
                                    <p style={{margin: '0em', fontSize: '1.5em', fontWeight: 'bolder'}}>
                                        {Math.round((1-(currentVocabSize/project.metrics.starting_vocab_size)) * 100)}%
                                    </p>
                                    <p style={{fontSize: '0.75em', fontWeight: 'bold'}}>
                                        Token Reduction
                                    </p>
                                </div>
                            </Col>
                            <Col>
                                <div style={{display: 'flex', flexDirection: 'column', padding: '0em', width: '100%'}}>
                                    <p style={{margin: '0em', fontSize: '1.5em', fontWeight: 'bolder'}}>
                                        {project.metrics.starting_oov_token_count - currentOOVTokenCount} / {project.metrics.starting_oov_token_count}
                                    </p>
                                    <p style={{fontSize: '0.75em', fontWeight: 'bold'}}>
                                        OOV Corrected
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                :
                <Col md="6" className="text-center"><Spinner animation="border" size="sm" variant="light"/></Col>
            }
                <Col md="3"></Col>
            </Row>



        </Container>
    )
}
