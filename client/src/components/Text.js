import React, { useState, useEffect } from 'react'
import Token from './Token'

export default function Text({data, textIndex, tokens_en, tokens_ds, lexNormDict, setLexNormDict}) {
    const [markedupText, setMarkedupText] = useState();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setMarkedupText(data.tokens.map(tokenInfo => {
            // console.log(tokenInfo);
            if (tokens_en.includes(tokenInfo.token)){
                return {...tokenInfo, classification: 'en'}

            } else if (tokens_ds.includes(tokenInfo.token)){
                return {...tokenInfo, classification: 'ds'}

            } 
            
            else {
                // Note: UA refers to unassigned
                return {...tokenInfo, classification: 'ua'}
            }
        })
        )
        setLoaded(true);
    }, [data])

    return (
        <div id="text-container" style={{display: 'flex', flexDirection:'row'}}>
            {
                loaded ? markedupText.map((tokenInfo) => {
                    
                    // console.log(tokenInfo, textIndex);

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
