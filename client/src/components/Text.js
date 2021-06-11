import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import { useContextMenu } from "react-contexify";
import Token from './Token'
import TextContextMenu from './utils/TextContextMenu';
import axios from 'axios';


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
    const MENU_ID = `menu-${text._id}`;
    const { show: showContextMenu } = useContextMenu({ id: MENU_ID });

    // console.log('text ', text._id,  'content', text, ' weight ', text.weight);

    // If tokenize mode then show full string WITH replacements
    const [textString, setTextString] = useState(text.tokens.map(tokenInfo => tokenInfo.replacement ? tokenInfo.replacement : tokenInfo.value).join(' '))

    const handleTextChange = (e) => {
        // Modifies white space in textstring and ignores any other character modification
        // TODO: figure out how to do this.
        setTextString(e.target.value);
    }

    const updateText = async (textString, isSingle) => {
        console.log(textString, isSingle)

        if (isSingle){

            const response = await axios.patch(`/api/text/tokenize/${text._id}`, { 'new_string': textString});

            if (response.status === 200){
                console.log(' text update response ', response.data);
            }
        }   
    }
    

    return (
        <div id="text-container" className={classes.container} key={textIndex}>
            {
                tokenizeMode ?
                <div>
                    <input
                        type="text"
                        value={textString}
                        onChange={e => handleTextChange(e)}
                        autoComplete="off"
                        className={classes.text}
                        onContextMenu={(e) => showContextMenu(e)}
                    />
                    <TextContextMenu
                        menu_id={MENU_ID}
                        textString={textString}
                        updateText={updateText}
                    />
                </div>
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
