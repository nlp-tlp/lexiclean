import React from 'react'
import { createUseStyles } from 'react-jss';
import { Dropdown, Container, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa'



const useStyles = createUseStyles({
    container: {
        paddingTop: '1em',
        paddingBottom: '1em',
        backgroundColor: '#D9D9D9',
        maxWidth: '100%'
    },
    title: {
        fontWeight: 'bolder',
        fontSize: '2em'
    },
    metricsContainer: {
        display: 'inline-block',
        backgroundColor: '#A2D2D2',
        margin: 'auto',
        padding: '0.2em 0.5em 0em 0.5em',
        borderRadius: '0.5em'
    }
})

export default function Header({lexNormDict, setShowUpload, setShowDownload, setShowProgress, setSaved}) {
    const classes = useStyles();
    const changeCount = Object.keys(lexNormDict).map(textIndex => Object.keys(lexNormDict[textIndex]).length).reduce((a, b) => a + b, 0);

    const showSaveBtn = Object.keys(lexNormDict).length > 0;

    return (
        <Container as="div" className={classes.container}>
            <Row className="align-items-center">
                <Col>
                    <Dropdown>
                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                            Menu
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setShowUpload(true)}>Start New Project</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowDownload(true)}>Download Results</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowProgress(true)}>Review Progress</Dropdown.Item>
                            <Dropdown.Item onClick={() => console.log('need redirect!')}>Home</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col xs={8}className={classes.title}>Lexnorm Annotator</Col>
                <Col>
                {
                    showSaveBtn ?
                        <div style={{fontSize: '32px', color: '#F2A477', cursor: 'pointer'}} onClick={() => setSaved(true)}>
                            <FaSave/>
                        </div>
                        : null
                }
                </Col>

            </Row>
        </Container>
    )
}
