import React from 'react'
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      marginBottom: '2em',
      marginTop: '2em'
    },
    title: {
        fontWeight: 'bolder'
    },
    metricsContainer: {
        display: 'inline-block',
        backgroundColor: '#D9D9D9',
        margin: 'auto',
        padding: '0.2em 0.5em 0em 0.5em',
        borderRadius: '0.5em'

    }
})

export default function Header({textCount, lexNormDict}) {
    const classes = useStyles();

    // TODO: finish logic once data is correctly added to lexnorm dictionary
    const changeCount = Object.keys(lexNormDict).map(text => text.length).reduce((a, b) => a + b, 0)
    // console.log(changeCount);

    return (
        <div className={classes.wrapper}>
            <h1 className={classes.title}>Lexnorm Annotator</h1>
            <div className={classes.metricsContainer}>
                <h3>{changeCount}C {textCount}T</h3>
            </div>
        </div>
    )
}
