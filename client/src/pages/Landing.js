import React from 'react'
import { createUseStyles } from 'react-jss';
import { IoSpeedometer } from 'react-icons/io5';


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
    return (
        <div className={classes.container}>
            <div
                style={{display: 'flex', justifyContent:'space-between', padding: '1em', margin: '0em 1em 0em 1em', verticalAlign: 'middle'}}
            >
                <div style={{fontSize: '24px', fontWeight: 'bolder'}}>
                    Lexiclean
                </div>
                <div
                    style={{color: 'rgb(143, 143, 143)', fontSize: '16px', fontWeight: 'bold', border: '2px solid rgb(143, 143, 143)', padding: '0.25em 1em 0.25em 1em'}}
                >
                    Login
                </div>
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
    )
}
