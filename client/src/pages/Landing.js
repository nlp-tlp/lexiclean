import React from 'react'
import { createUseStyles } from 'react-jss';
import { IoSpeedometer, IoEnter, IoExpand, IoTrophy } from 'react-icons/io5';
import { MdBubbleChart } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection:'column',
        backgroundColor: 'rgb(217, 217, 217)',
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
    brandLogo: {
        fontSize: '32px',
        fontWeight: 'bolder'
    },
    brandText: {
        fontSize: '24px',
        fontWeight: 'bolder'
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        textAlign:'center',
        marginTop: '10vh',
        width: '50vw',
        margin: 'auto'
    },
    title: {
        fontSize: '68px',
        fontWeight: 'bold'
    },
    topText: {

    },
    underText: {

    },
    signupButton:{
        marginTop: '1em',
        color: 'rgb(143, 143, 143)',
        fontSize: '26px',
        fontWeight: 'bold',
        backgroundColor: '#EAEAEA',
        border: '2px solid rgb(143, 143, 143)',
        padding: '0.25em 1em 0.25em 1em',
        width: '50%',
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
    },
    detailText: {
        display: 'flex',
        flexDirection: 'column',
    },
    detailIcon: {
        fontSize: '48px',
        margin: 'auto'
    }
})

export default function Landing({ token, logout }) {
    const classes = useStyles();
    const history = useHistory();
    return (
        <>
            <div className={classes.container}>
                <div className={classes.header}>
                    <div style={{display: 'flex'}}>
                        <MdBubbleChart className={classes.brandLogo}/>
                        <p className={classes.brandText}>Lexiclean</p>
                    </div>
                    <Button
                        className={classes.logInOutButton}
                        onClick={token ? logout : () => history.push('/login')}
                    >
                        { token ? "Logout": "Log In" }
                    </Button>
                </div>

                <div className={classes.main}>
                    <p className={classes.topText}>Multi-task Lexical Normalisation</p>
                    <h1 className={classes.title}>
                        Lexiclean
                    </h1>
                    <h3 className={classes.underText}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ut ex in risus ullamcorper cursus.
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
