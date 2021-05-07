import React from 'react'
import { createUseStyles } from 'react-jss';
import { Button } from 'react-bootstrap';


const useStyles = createUseStyles({
    footer: {
        marginTop: '2em',
        position: 'absolute',
        bottom: '0',
        width: '100%',
        backgroundColor: '#D9D9D9',
        paddingTop: '1em'
    },
})


export default function Footer() {
    const classes = useStyles();
    return (
        <div className={classes.footer}>
            <p>Footer</p>
        </div>
    )
}
