import React from 'react'
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    container: {
        backgroundColor: '#D9D9D9',
    }
})

export default function Sidebar() {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <h1>Sidebar</h1>
        </div>
    )
}
