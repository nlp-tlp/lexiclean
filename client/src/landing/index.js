import React from 'react'
import { createUseStyles } from 'react-jss';
import { BiSmile } from 'react-icons/bi'
import { IoSpeedometer, IoEnter, IoExpand, IoTrophy, IoLogoGithub, IoLogoYoutube } from 'react-icons/io5';
import { useHistory } from 'react-router-dom';
import { MdBubbleChart } from 'react-icons/md';
import { Button, Navbar, Nav, Container, Row, Col } from 'react-bootstrap';

import NavBar from '../common/components/navbar'


const useStyles = createUseStyles({
    underText: {
        fontSize: '26px'
    },
    signupButton:{
        marginTop: '1em',
        color: 'black',
        fontSize: '26px',
        fontWeight: 'bold',
        backgroundColor: '#f8f9fa',
        border: '2px solid black',
        padding: '0.25em 1em 0.25em 1em',
        maxWidth: '20vw',
        margin:'auto',
        '&:hover':{
            backgroundColor: 'rgb(143, 143, 143)',
            borderColor: 'white'
        },
        '&:active:':{
            backgroundColor: 'white',
            borderColor: 'white',
            color: 'rgb(143, 143, 143)'
        }
    },
    details:{
        display: 'flex',
        justifyContent:'space-evenly',
        marginTop: '10vh',
        maxWidth: '70vw',
        margin: 'auto',
        padding: '0em 1em 0em 1em'
    },
    detailBox: {
        display: 'flex',
        flexDirection: 'row',
        padding: '0.5em',
        flex: '1 1 0'
    },
    detailText: {
        display: 'flex',
        flexDirection: 'column',
    },
    detailIcon: {
        fontSize: '48px',
        margin: 'auto'
    },
    githubLogo: {
        fontSize: '22px',
        marginRight: '1em',
    },
    youtubeLogo: {
        fontSize: '22px',
        marginRight: '1em',
    }
})

export default function Landing({ token, logout }) {
    const classes = useStyles();
    const history = useHistory();
    
    return (
        <>
            <NavBar token={token} logout={logout}/>
            <Container className="text-center" style={{marginBottom: '5em'}}>
                <Row className="justify-content-center" style={{marginTop: '10vh'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <MdBubbleChart style={{fontSize: '80px'}}/>
                            <h1 style={{letterSpacing: '2px', fontWeight: 'bold', fontSize: '60px'}}>LexiClean</h1>
                        </div>
                </Row>
                <Row className="justify-content-center" style={{marginTop: '2vh', marginBottom: '2vh'}}>
                    <Col xs={8} style={{margin:'auto'}}>
                    <h3 className={classes.underText}>
                        Lexiclean is an annotation tool developed for rapid multi-task annotation of noisy corpora for the task of lexical normalisation
                    </h3>
                    </Col>
                </Row>
                
                <Row style={{marginTop: '2vh', marginBottom: '2vh'}}>
                    <Col>
                        <Button
                            className={classes.signupButton}
                            onClick={token ? () => history.push("/feed") : () => history.push("/signup")}
                        >
                            { token ? <div>Enter <IoEnter /></div> : "Sign Up"}
                        </Button>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col xs={4}>
                         <div className={classes.detailBox}>
                             <div className={classes.detailText} >
                                 <IoSpeedometer className={classes.detailIcon}/>
                                 <h3>Rapid</h3>
                                 <p>Enable fast corpus wide multi-task annotation to reduce annotation effort</p>
                             </div>
                         </div>
                    </Col>
                    <Col xs={4}>
                        <div className={classes.detailBox}>
                            <div className={classes.detailText}>
                                <IoExpand className={classes.detailIcon}/>
                                <h3>Flexible</h3>
                                <p>Supports token normalisation formats 1:1 and 1:N directly, and N:1 indirectly</p>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={4}>
                        <div className={classes.detailBox}>
                            <div className={classes.detailText}>
                                <BiSmile className={classes.detailIcon}/>
                                <h3>Intuitive</h3>
                                <p>Maintains a simple and easy-to-use interface for improved consistency</p>
                            </div>
                        </div>
                    </Col>
                    <Col xs={4}>
                        <div className={classes.detailBox}>
                            <div className={classes.detailText}>
                                <IoTrophy className={classes.detailIcon}/>
                                <h3>Dynamic</h3>
                                <p>Permits organic schema development during annotation</p>
                            </div>
                        </div>
                    </Col>
                </Row>

            </Container>

            <Navbar bg="light" fixed="bottom">
                <Navbar.Text className="m-auto">
                    © UWA NLP-TLP Group 2021.
                </Navbar.Text>
            </Navbar>
        </>
    )
}
