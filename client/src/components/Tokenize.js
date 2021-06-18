import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import { useContextMenu } from "react-contexify";
import TextContextMenu from './utils/TextContextMenu';
import axios from 'axios';

const useStyles = createUseStyles({
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
    }
})

const MIN_WIDTH = 60;   // px

export default function Tokenize({ text }) {

    const classes = useStyles();
    const MENU_ID = `menu-${text._id}`;
    const { show: showContextMenu } = useContextMenu({ id: MENU_ID });
    const [textTemp, setTextTemp] = useState(text);

    // If tokenize mode then show full string WITH replacements
    const [originalText, setOriginalText] = useState(text.tokens.map(tokenInfo => tokenInfo.replacement ? tokenInfo.replacement : tokenInfo.value).join(' '))
    const [textString, setTextString] = useState(text.tokens.map(tokenInfo => tokenInfo.replacement ? tokenInfo.replacement : tokenInfo.value).join(' '))
    const [inputWidth, setInputWidth] = useState(`${(originalText.length + 2) * 10 > MIN_WIDTH ? (originalText.length + 2) * 12 : MIN_WIDTH }px`)

    const handleTextChange = (e) => {
        if (originalText.split(' ').join('') === e.target.value.split(' ').join('')){
            setTextString(e.target.value);
        }
    }

    const updateText = async (textString, isSingle) => {
        if (isSingle){
            const response = await axios.patch(`/api/text/tokenize/${text._id}`, { 'new_string': textString});
            if (response.status === 200){
                setTextTemp(response.data);
            }
        }   
    }

    return (
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
    )
}
