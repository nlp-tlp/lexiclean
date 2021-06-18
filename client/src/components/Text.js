import React from 'react'
import { createUseStyles } from 'react-jss';
import Token from './Token'

import Tokenize from './Tokenize';

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection:'row',
        flexWrap: 'wrap',
        maxHeight: '1em'
    }
})

export default function Text({text,
                              replacementDict,
                              setReplacementDict,
                              metaTagSuggestionMap,
                              setMetaTagSuggestionMap,
                              updateSingleToken,
                              setUpdateSingleToken,
                              selectedTokens,
                              setSelectedTokens,
                              bgColourMap,
                              tokenize,
                              changeTrigger,
                              setChangeTrigger,
                              setToastInfo
                            }) {
    const classes = useStyles();
    const textIndex = text._id ? text._id : null;
    return (
        <div
            id="text-container"
            className={classes.container}
            key={textIndex}
        >
            {   tokenize === textIndex ? <Tokenize text={text} /> :
                text ? text.tokens.map((tokenInfo) => {
                    const tokenProps = {
                            tokenInfo,
                            textIndex,
                            replacementDict,
                            setReplacementDict,
                            metaTagSuggestionMap,
                            setMetaTagSuggestionMap,
                            updateSingleToken,
                            setUpdateSingleToken,
                            selectedTokens,
                            setSelectedTokens,
                            bgColourMap,
                            tokenize,
                            changeTrigger,
                            setChangeTrigger,
                            setToastInfo
                        }
                    return(<Token {...tokenProps} />)})
                : <p>Loading...</p>
            }
        </div>
    )
}
