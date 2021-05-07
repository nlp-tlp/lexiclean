import React, { useState, useEffect } from 'react'
import Token from './Token'

export default function Text({data, textIndex, tokens_en, tokens_ds, replacementMap, setReplacementMap, lexNormDict, setLexNormDict}) {
    const [markedupText, setMarkedupText] = useState();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const markupTexts = () => {
            setLoaded(false);
            setMarkedupText(data.tokens.map(tokenInfo => {
                // console.log(tokenInfo);
                if (tokens_en.includes(tokenInfo.token)){
                    return {...tokenInfo, classification: 'en', original: tokenInfo.token}
    
                } else if (tokens_ds.includes(tokenInfo.token)){
                    return {...tokenInfo, classification: 'ds', original: tokenInfo.token}
    
                } else if (replacementMap && Object.keys(replacementMap).includes(tokenInfo.token)){
                    // Replace token in-situ
                    // Note: RP refers to replaced
                    // console.log('replacement occured on', tokenInfo.token);
                    const updatedToken = {...tokenInfo, token: replacementMap[tokenInfo.token], classification: 'rp', original: tokenInfo.token}
                    // console.log(updatedToken)
                    return updatedToken
                }
                else {
                    // Note: UA refers to unassigned
                    return {...tokenInfo, classification: 'ua', original: tokenInfo.token}
                }
            }))
            setLoaded(true);
        }

        markupTexts();
    }, [data, replacementMap])

    return (
        <div id="text-container" style={{display: 'flex', flexDirection:'row'}}>
            {
                (loaded && markedupText)
                ? 
                    markedupText.map((tokenInfo) => {
                    
                    // console.log(tokenInfo, textIndex);

                    return(
                            <Token
                                tokenInfo={tokenInfo}
                                textIndex={textIndex}
                                lexNormDict={lexNormDict}
                                setLexNormDict={setLexNormDict}
                                replacementMap={replacementMap}
                                setReplacementMap={setReplacementMap}
                            />
                            )})
                : <p>Loading...</p>
            }
        </div>
    )
}
