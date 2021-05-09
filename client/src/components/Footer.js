import React from 'react'
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    footer: {
        marginTop: '2em',
        position: 'absolute',
        bottom: '0',
        width: '100%',
        backgroundColor: '#D9D9D9',
        paddingTop: '1em',
        textAlign: 'center'
    },
})


export default function Footer() {
    const classes = useStyles();
    return (
        <div className={classes.footer}>
            <p>UWA NLP-TLP 2021.</p>
        </div>
    )
}
