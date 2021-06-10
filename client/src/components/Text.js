import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import Token from './Token'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection:'row',
        flexWrap: 'wrap'
    },
    text: {
        padding: '0.5em',
        marginRight: '0.5em',
        border: 'none',
        verticalAlign: 'center',
        textAlign: 'left',
        borderRadius: '4px',
        '&:hover': {
            opacity: '0.8'
        },
        wordSpacing: '1em',
        backgroundColor: 'rgba(0,0,0,0.1)',
        minWidth: '50vw'
    },
})


export default function Text({text, textIndex, replacementDict, setReplacementDict, metaTagSuggestionMap, setMetaTagSuggestionMap, updateSingleToken, setUpdateSingleToken, selectedTokens, setSelectedTokens, bgColourMap, tokenizeMode}) {
    const classes = useStyles();

    // console.log('text ', text._id,  'content', text, ' weight ', text.weight);

    // If tokenize mode then show full string WITH replacements
    const [textString, setTextString] = useState(text.tokens.map(tokenInfo => tokenInfo.replacement ? tokenInfo.replacement : tokenInfo.value).join(' '))

    return (
        <div id="text-container" className={classes.container} key={textIndex}>
            {
                tokenizeMode ?
                <input
                    type="text"
                    value={textString}
                    onChange={e => setTextString(e.target.value)}
                    autoComplete="off"
                    className={classes.text}
                    // onContextMenu={(e) => showContextMenu(e)}
                />
                :
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
