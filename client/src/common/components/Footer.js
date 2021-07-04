import React from 'react'
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    footer: {
        // marginTop: '2em',
        position: 'relative',
        bottom: '0',
        width: '100%',
        backgroundColor: '#8F8F8F',
        paddingTop: '0.5em',
        textAlign: 'center',
        borderTop: '1px #D9D9D9 solid',
        fontSize: '12px',
        color: '#F8F9FA'
    },
})


export default function Footer() {
    const classes = useStyles();
    return (
        <div className={classes.footer}>
            <p>UWA NLP-TLP 2021.<br/>
            <small>v1.0</small></p>
        </div>
    )
}
