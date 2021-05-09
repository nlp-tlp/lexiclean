import React, { useState, useEffect } from 'react'
import { createUseStyles } from 'react-jss';
import Token from './Token'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection:'row',
        flexWrap: 'wrap'
    }
})

export default function Text({text, textIndex, maps, setMaps, replacementDict, setReplacementDict}) {
    const classes = useStyles();
    return (
        <div id="text-container" className={classes.container} key={textIndex}>
            {
                text ?
                    text.tokens.map((tokenInfo) => {
                    return(
                            <Token
                                tokenInfo={tokenInfo}
                                textIndex={textIndex}
                                replacementDict={replacementDict}
                                setReplacementDict={setReplacementDict}
                            />
                            )})
                : <p>Loading...</p>
            }
        </div>
    )
}
