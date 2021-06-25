import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import Token from './Token'

import Tokenize from './Tokenize';

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection:'row',
        flexWrap: 'wrap',
        // maxHeight: '1em'
    }
})

export default function Text({project, 
                              text,
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
                              setToastInfo,
                              activeMaps,
                              setSavePending
                            }) {
    const classes = useStyles();
    const textIndex = text._id ? text._id : null;

    const [textIntermediate, setTextIntermediate] = useState(text);

    // console.log('text info ->', text);

    return (
        <div
            id="text-container"
            className={classes.container}
            key={textIndex}
        >
            {   tokenize === textIndex && project ?
                <Tokenize
                    project={project}
                    textIntermediate={textIntermediate}
                    setTextIntermediate={setTextIntermediate}
                /> 
                :
                textIntermediate ? textIntermediate.tokens.map((tokenInfo) => {
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
                            setToastInfo,
                            activeMaps,
                            setSavePending
                        }
                    return(<Token {...tokenProps} />)})
                : <p>Loading...</p>
            }
        </div>
    )
}
