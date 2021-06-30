import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import { useContextMenu } from "react-contexify";
import TextareaAutosize from 'react-textarea-autosize';
import TextContextMenu from './utils/TextContextMenu';
import {ErrorBoundary} from 'react-error-boundary';
import axios from 'axios';

const useStyles = createUseStyles({
    text: {
        padding: '0.7em 0em 0.7em 1.1em',
        marginRight: '0.5em',
        marginBottom: '0.5em',
        border: 'none',
        textAlign: 'left',
        borderRadius: '4px',
        '&:hover': {
            opacity: '0.8'
        },
        wordSpacing: '2.5em',
        backgroundColor: '#ffffbf',
        resize: 'none',
    }
})

const MIN_WIDTH = 60;   // px

export default function Tokenize({ project, textIntermediate, setTextIntermediate }) {

    const classes = useStyles();
    const MENU_ID = `menu-${textIntermediate._id}`;
    const { show: showContextMenu } = useContextMenu({ id: MENU_ID });

    const MAX_WIDTH = document.getElementById('text-container').offsetWidth; // px

    // If tokenize mode then show full string WITH replacements
    const [originalText, setOriginalText] = useState(textIntermediate.tokens.map(tokenInfo => tokenInfo.value).join(' '))
    const [textString, setTextString] = useState(textIntermediate.tokens.map(tokenInfo => tokenInfo.value).join(' '))
    const [inputWidth, setInputWidth] = useState(`${((originalText.length + 2) * 10 > MIN_WIDTH && (originalText.length + 2) * 10 < MAX_WIDTH) ? (originalText.length + 2) * 16 : ((originalText.length + 2) * 10 > MAX_WIDTH) ? MAX_WIDTH : MIN_WIDTH }px`)

    const handleTextChange = (e) => {
        if (originalText.split(' ').join('') === e.target.value.split(' ').join('')){
            setTextString(e.target.value);
        }
    }

    const updateText = async (textString, isSingle) => {
        if (isSingle){
            const response = await axios.patch(`/api/text/tokenize/${textIntermediate._id}`, { 'new_string': textString, 'project_id': project._id});
            if (response.status === 200){
                setTextIntermediate(response.data);
            }
        }   
    }

    const ErrorHandler = () => {
        return (
            <div>
                <p>Something went wrong...</p>
            </div>
        )
    }

    return (
        <ErrorBoundary
            FallbackComponent={ErrorHandler}
        >
            <div>
                <TextareaAutosize
                    type="text"
                    value={textString}
                    onChange={e => handleTextChange(e)}
                    autoComplete="off"
                    className={classes.text}
                    onContextMenu={e => showContextMenu(e)}
                    style={{ width: inputWidth}}
                    />
                <TextContextMenu
                    menu_id={MENU_ID}
                    textString={textString}
                    setTextString={setTextString}
                    updateText={updateText}
                    originalText={originalText}
                    />
            </div>
        </ErrorBoundary>
    )
}
