import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import { IoSpeedometer, IoEnter } from 'react-icons/io5';
import { useHistory } from 'react-router-dom';

import SignUpModal from '../components/modals/SignUpModal'
import useToken from '../components/auth/useToken';


const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection:'column',
        backgroundColor: 'rgb(217, 217, 217)',
        height: '100vh'
    }
})

export default function Landing() {
    const classes = useStyles();
    const [showSignUp, setShowSignUp] = useState(false);

    const history = useHistory();

    const { token, setToken } = useToken();

    return (
        <>
            { showSignUp ? <SignUpModal showSignUp={showSignUp} setShowSignUp={setShowSignUp} /> : null}

            <div className={classes.container}>
                <div
                    style={{display: 'flex', justifyContent:'space-between', padding: '1em', margin: '0em 1em 0em 1em', verticalAlign: 'middle'}}
                >
                    <div style={{fontSize: '24px', fontWeight: 'bolder'}}>
                        Lexiclean
                    </div>
                    <button
                        style={{color: 'rgb(143, 143, 143)', fontSize: '16px', fontWeight: 'bold', border: '2px solid rgb(143, 143, 143)', padding: '0.25em 1em 0.25em 1em'}}
                    >
                        { token ? "Logout" : "Login" }
                    </button>
                </div>

                <div
                    style={{display: 'flex', flexDirection: 'column', textAlign:'center', marginTop: '20vh', width: '50vw', margin: 'auto'}}
                >
                    <p>Multi-task Lexical Normalisation</p>
                    <h1 style={{fontSize: '68px'}}>
                        Lexiclean
                    </h1>
                    <h3>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ut ex in risus ullamcorper cursus.
                    </h3>
                    {
                        !token ? 
                            <button
                                style={{marginTop: '1em', color: 'rgb(143, 143, 143)', fontSize: '26px', backgroundColor: '#EAEAEA', fontWeight: 'bold', border: '2px solid rgb(143, 143, 143)', padding: '0.25em 1em 0.25em 1em', width: '50%', margin:'auto'}}
                                onClick={() => setShowSignUp(!showSignUp)}
                            >
                                Sign Up
                            </button>
                        :
                            <button
                                style={{display: 'flex', justifyContent: 'space-between', verticalAlign: 'middle', marginTop: '1em', color: 'rgb(143, 143, 143)', fontSize: '26px', backgroundColor: '#EAEAEA', fontWeight: 'bold', border: '2px solid rgb(143, 143, 143)', padding: '0.25em 1em 0.25em 1em', width: '60%', margin:'auto'}}
                                onClick={() => window.location.href="/feed"}
                            >
                                Start Annotating <IoEnter/>
                            </button>
                    }
                </div>
                <div style={{display: 'flex', justifyContent:'space-evenly', marginBottom: '30vh', maxWidth: '60vw', margin: 'auto', padding: '0em 1em 0em 1em'}}>
                    <div style={{display: 'flex', flexDirection: 'row', padding: '0.5em'}}>
                        {/* <IoSpeedometer style={{fontSize: '48px'}}/> */}
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <h3>Rapid</h3>
                            <p>Enable fast corpus wide annotations to reduce annotation effort </p>
                        </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', padding: '0.5em'}}>
                        {/* <IoSpeedometer style={{fontSize: '28px'}}/> */}
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <h3>Consistent</h3>
                            <p>Ensure intra-annotator consistency through an intuitive interface</p>
                        </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', padding: '0.5em'}}>
                        {/* <IoSpeedometer style={{fontSize: '28px'}}/> */}
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <h3>Flexible</h3>
                            <p>Permit organic hierarchy development during annotation</p>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}
