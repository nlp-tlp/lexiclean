import React from 'react'
import { createUseStyles } from 'react-jss';
import { IoSpeedometer, IoEnter, IoExpand, IoTrophy, IoLogoGithub, IoLogoYoutube } from 'react-icons/io5';
import { useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import BrandLogo from '../components/images/logo_min_transparent_black.png';
import BrandImage from '../components/images/logo_transparent_black.png';

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection:'column',
        backgroundColor: '#E2E2E2',
        height: '100vh'
    },
    header: {
        display: 'flex',
        justifyContent:'space-between',
        padding: '1em',
        margin: '0em 1em 0em 1em',
        verticalAlign: 'middle'
    },
    logInOutButton: {
        color: 'rgb(143, 143, 143)',
        fontSize: '16px',
        fontWeight: 'bold',
        border: '2px solid rgb(143, 143, 143)',
        padding: '0em 1em 0em 1em',
        backgroundColor: 'transparent',
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
    brandImage: {
        width: '25em',
        height: 'auto',
        margin: 'auto',
        padding: '1em'
    },
    brandLogo: {
        width: '2em',
        height: 'auto'
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        textAlign:'center',
        marginTop: '10vh',
        width: '50vw',
        margin: 'auto'
    },
    topText: {
        fontSize: '18px'
    },
    underText: {
        fontSize: '26px'
    },
    signupButton:{
        marginTop: '1em',
        color: 'rgb(143, 143, 143)',
        fontSize: '26px',
        fontWeight: 'bold',
        backgroundColor: '#EAEAEA',
        border: '2px solid rgb(143, 143, 143)',
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
        fontSize: '40px',
        cursor: 'pointer',
        marginRight: '1em',
        margin: 'auto',
        '&:hover':{
            color: 'rgb(143, 143, 143)',
        }
    },
    youtubeLogo: {
        fontSize: '40px',
        cursor: 'pointer',
        marginRight: '1em',
        margin: 'auto',
        '&:hover':{
            color: 'rgb(143, 143, 143)',
        }
    }
})

export default function Landing({ token, logout }) {
    const classes = useStyles();
    const history = useHistory();
    return (
        <>
            <div className={classes.container}>
                <div className={classes.header}>
                    <div>
                    </div>
                    {/* <img className={classes.brandLogo} src={BrandLogo} alt="lexiclean logo"/> */}
                    <div style={{display: 'flex'}}>
                        <IoLogoGithub
                            className={classes.githubLogo}
                            onClick={() => window.open("https://github.com/nlp-tlp/lexiclean", "_blank")}
                        />
                        <IoLogoYoutube
                            className={classes.youtubeLogo}
                            onClick={() => window.open("https://youtube.com", "_blank")}
                        />
                        <Button
                            className={classes.logInOutButton}
                            onClick={token ? logout : () => history.push('/login')}
                        >
                            { token ? "Logout": "Log In" }
                        </Button>
                    </div>
                </div>

                <div className={classes.main}>
                    {/* <p className={classes.topText}>Multi-task Lexical Normalisation</p> */}
                    <img className={classes.brandImage} src={BrandImage} alt="lexiclean logo"/>
                    <h3 className={classes.underText}>
                        Lexiclean is an annotation tool built rapid multi-task annotation of corpora for the task of lexical normalisation.
                    </h3>

                    <Button
                        className={classes.signupButton}
                        onClick={token ? () => history.push("/feed") : () => history.push("/signup")}
                    >
                        { token ? <div>Enter <IoEnter /></div> : "Sign Up"}
                    </Button>

                    <div className={classes.details}>
                        <div className={classes.detailBox}>
                            <div className={classes.detailText} >
                                <IoSpeedometer className={classes.detailIcon}/>
                                <h3>Rapid</h3>
                                <p>Enable fast corpus wide annotations to reduce annotation effort </p>
                            </div>
                        </div>
                        <div className={classes.detailBox}>
                            <div className={classes.detailText}>
                                <IoTrophy className={classes.detailIcon}/>
                                <h3>Consistent</h3>
                                <p>Ensure intra-annotator consistency through an intuitive interface</p>
                            </div>
                        </div>
                        <div className={classes.detailBox}>
                            <div className={classes.detailText}>
                                <IoExpand className={classes.detailIcon}/>
                                <h3>Flexible</h3>
                                <p>Permit organic hierarchy development during annotation</p>
                            </div>
                        </div>
                    </div>

                </div>


            </div>
        </>
    )
}
