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
        flexWrap: 'wrap',
        maxHeight: '1em'
    },
    text: {
        padding: '0.5em 0em 0.5em 1.1em',
        marginRight: '0.5em',
        marginBottom: '0.5em',
        border: 'none',
        verticalAlign: 'center',
        textAlign: 'left',
        borderRadius: '4px',
        '&:hover': {
            opacity: '0.8'
        },
        wordSpacing: '1em',
        backgroundColor: '#ffffbf',
    },
})

const MIN_WIDTH = 60;   // px

export default function Text({text,
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
                                setChangeTrigger
                            }) {

    const classes = useStyles();
    const MENU_ID = `menu-${text._id}`;
    const { show: showContextMenu } = useContextMenu({ id: MENU_ID });

    const [textTemp, setTextTemp] = useState(text);

    // console.log('text ', text._id,  'content', text, ' weight ', text.weight);

    // If tokenize mode then show full string WITH replacements
    const [originalText, setOriginalText] = useState(text.tokens.map(tokenInfo => tokenInfo.replacement ? tokenInfo.replacement : tokenInfo.value).join(' '))
    const [textString, setTextString] = useState(text.tokens.map(tokenInfo => tokenInfo.replacement ? tokenInfo.replacement : tokenInfo.value).join(' '))
    const [inputWidth, setInputWidth] = useState(`${(originalText.length + 2) * 10 > MIN_WIDTH ? (originalText.length + 2) * 12 : MIN_WIDTH }px`)

    const handleTextChange = (e) => {
        // Modifies white space in textstring and ignores any other character modification
        // TODO: figure out how to do this.
        const originalBoC = originalText.split(' ').join('');
        const currentBoC = e.target.value.split(' ').join('');
        if (originalBoC === currentBoC){
            setTextString(e.target.value);
        }
    }

    const updateText = async (textString, isSingle) => {
        // console.log(textString, isSingle)
        if (isSingle){
            const response = await axios.patch(`/api/text/tokenize/${text._id}`, { 'new_string': textString});
            if (response.status === 200){
                console.log(' text update response ', response.data);
                setTextTemp(response.data);
            }
        }   
    }
    

    return (
        <div
            id="text-container"
            className={classes.container}
            key={textIndex}
        >
            {
                tokenize === textIndex ?
                <div>
                    <input
                        type="text"
                        value={textString}
                        onChange={e => handleTextChange(e)}
                        autoComplete="off"
                        className={classes.text}
                        onContextMenu={(e) => showContextMenu(e)}
                        style={{ width: inputWidth }}
                    />
                    <TextContextMenu
                        menu_id={MENU_ID}
                        textString={textString}
                        updateText={updateText}
                    />
                </div>
                :
                textTemp ?
                    textTemp.tokens.map((tokenInfo) => {
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
                                tokenize={tokenize}
                                changeTrigger={changeTrigger}
                                setChangeTrigger={setChangeTrigger}
                            />
                            )})
                : <p>Loading...</p>
            }

        </div>
    )
}
