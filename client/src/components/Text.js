import React from 'react'
import { createUseStyles } from 'react-jss';
import Token from './Token'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection:'row',
        flexWrap: 'wrap'
    }
})


export default function Text({text, textIndex, replacementDict, setReplacementDict, metaTagSuggestionMap, setMetaTagSuggestionMap, updateSingleToken, setUpdateSingleToken, selectedTokens, setSelectedTokens, bgColourMap}) {
    const classes = useStyles();

    // console.log('text ', text._id,  ' weight ', text.weight);

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
                                metaTagSuggestionMap={metaTagSuggestionMap}
                                setMetaTagSuggestionMap={setMetaTagSuggestionMap}
                                updateSingleToken={updateSingleToken}
                                setUpdateSingleToken={setUpdateSingleToken}
                                selectedTokens={selectedTokens}
                                setSelectedTokens={setSelectedTokens}
                                bgColourMap={bgColourMap}
                            />
                            )})
                : <p>Loading...</p>
            }
        </div>
    )
}
