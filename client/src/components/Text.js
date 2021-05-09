import React, { useState, useEffect } from 'react'
import Token from './Token'

export default function Text({text, textIndex, maps, setMaps, lexNormDict, setLexNormDict}) {
    return (
        <div id="text-container" style={{display: 'flex', flexDirection:'row'}} key={textIndex}>
            {
                text ?
                    text.tokens.map((tokenInfo) => {
                    return(
                            <Token
                                tokenInfo={tokenInfo}
                                textIndex={textIndex}
                                lexNormDict={lexNormDict}
                                setLexNormDict={setLexNormDict}
                            />
                            )})
                : <p>Loading...</p>
            }
        </div>
    )
}
