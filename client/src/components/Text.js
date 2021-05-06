import React, { useState, useEffect } from 'react'
import Token from './Token'

export default function Text({text, textIndex, tokens_en, tokens_ds, lexNormDict, setLexNormDict}) {
    const [markedupText, setMarkedupText] = useState();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Tokenize text
        const tokenizedText = text.split(' ');
        
        setMarkedupText(tokenizedText.map((token, index) => {
            console.log(token, index);
            if (tokens_en.includes(token)){
                return {index: index, token: token, classification: 'en'}

            } else if (tokens_ds.includes(token)){
                return {index: index, token: token, classification: 'ds'}

            } else {
                // Note: UA refers to unassigned
                return {index: index, token: token, classification: 'ua'}
            }
        })
        )
        setLoaded(true);
    }, [text])

    return (
        <div id="text-container" style={{display: 'flex', flexDirection:'row'}}>
            {
                loaded ? markedupText.map((tokenInfo) => {return(
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
