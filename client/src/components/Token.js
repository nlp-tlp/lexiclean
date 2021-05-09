// color palettee: medium blue: #6F87A6, light orange: #F2A477, light grey: #D9D9D9, light green: #99BF9C
import React, { useState, useEffect } from 'react'
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import {
    Menu,
    Item,
    Separator,
    Submenu,
    useContextMenu
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { createUseStyles } from 'react-jss';
import axios from 'axios';

const useStyles = createUseStyles({
    token: {
        padding: '0.5em',
        marginRight: '0.5em',
        border: 'none',
        verticalAlign: 'center',
        textAlign: 'center',
        borderRadius: '4px',
        '&:hover': {
            opacity: '0.8'
        }
    }
})


// Color map for token classifications
// ua - unassigned, rp - replacement, sr - suggested replacemtn
const bgColorMap = { 'ds_abrv_en': '#D9D9D9', 'ua': '#F2A477', 'rp': '#99BF9C', 'sr': '#6BB0BF'}

export default function Token({tokenInfo, textIndex, replacementDict, setReplacementDict}) {
    const classes = useStyles();
    const { index, value } = tokenInfo;
    const tokenId = tokenInfo.token;
    const tokenIndex = index;
    const [replacedToken, setReplacedToken] = useState(tokenInfo.replacement);
    const [suggestedToken, setSuggestedToken] = useState(tokenInfo.suggested_replacement);


    const MENU_ID = `menu-${tokenIndex}`;
    const { show } = useContextMenu({ id: MENU_ID });
   
    const [originalToken] = useState(value);
    const [currentToken, setCurrentToken] = useState(replacedToken ? replacedToken : value); // Populate with replaced token if its available
    const [edited, setEdited] = useState(false);
    const [savedChange, setSavedChange] = useState(false);
    
    // Specify colour of token
    const tokenClassification = (tokenInfo.domain_specific || tokenInfo.abbreviation || tokenInfo.english_word) ? 'ds_abrv_en' : replacedToken ? 'rp' : suggestedToken ? 'sr' : 'ua';
    const [bgColor, setBgColor] = useState(bgColorMap[tokenClassification])

    const [showPopover, setShowPopover] = useState(false);
    const [showRemovePopover, setShowRemovePopover] = useState(false);
    const [showAddSuggestionPopover, setShowAddSuggestionPopover] = useState(false);


    const [inputWidth, setInputWidth] = useState(`${(currentToken.length + 2) * 8}px`)

    useEffect(() => {
        // Updates token colour based on state of token information
        const tokenClassification = (tokenInfo.domain_specific || tokenInfo.abbreviation || tokenInfo.english_word) ? 'ds_abrv_en' : replacedToken ? 'rp' : suggestedToken ? 'sr' : 'ua';
        setBgColor(bgColorMap[tokenClassification])
    }, [replacedToken, suggestedToken, tokenInfo])
    
    useEffect(() => {
        // Set input field width
        const minWidth = 50;
        const width = (currentToken.length + 2) * 10
        if (width < minWidth){
            setInputWidth(`${minWidth}px`)
        } else {
            setInputWidth(`${width}px`)
        }
    }, [currentToken])

    useEffect(() => {
        // Detect state change
        if(originalToken !== currentToken){
            setEdited(true);
        } else {
            // Remove from dictionary if the currentToken is reverted to its original form
            setEdited(false);
            setShowPopover(false);
        }
    }, [currentToken])

    // useEffect(() => {
    //     // console.log('hi')
    //     // This triggers a render event otherwise tokens get frozen...
    //     console.log(replacementDict)

    // }, [replacementDict])

    const modifyToken = (targetValue) => {
        setShowPopover(true);
        setCurrentToken(targetValue);
    }

    const addReplacement = async () => {
        const response = await axios.patch(`/api/token/replace/${tokenId}`, {replacement: currentToken});
        if (response.status === 200){
            console.log('replacement response', response);
            setSavedChange(true);
            setShowPopover(false);

            // Add replacement to replacementDict (used to update other tokens)
            setReplacementDict(prevState => ({...prevState, [originalToken]: currentToken}));

        }
    }

    const removeReplacement = async () => {
        const response = await axios.delete(`/api/token/replace-remove/${tokenId}`)
        if (response.status === 200){
            console.log('Replacement was successfully removed.')
            setCurrentToken(originalToken);
            setShowRemovePopover(false);
            setSavedChange(false);
            setReplacedToken(null);
            setEdited(false);

            // Remove replacement from dictionary (used to update other tokens)
            setReplacementDict(Object.keys(replacementDict).filter(token => token !== originalToken));
        }
    }

    const cancelChange = () => {
        setCurrentToken(originalToken);
        setSavedChange(false);
    }


    const addReplacementPopover = <Popover id={`popover`}>
                            <Popover.Title as="p" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '0.5em'}}>
                                    <Button onClick={() => addReplacement()} size="sm" variant="info">Yes</Button>
                                    <Button onClick={() => cancelChange()} size="sm" variant="secondary">No</Button>
                                </Popover.Title>
                            <Popover.Content>
                                <p>Add to dictionary?</p>
                                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 'auto', height: '2em'}}>
                                    <div>
                                        <strong>{originalToken}</strong> to <strong>{currentToken}</strong>
                                    </div>
                                </div>
                            </Popover.Content>
                        </Popover>
    
    const removeReplacementPopover = <Popover id={`remove-popover`}>
                            <Popover.Title as="p" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '0.5em'}}>
                                    <Button onClick={() => removeReplacement()} size="sm" variant="info">Yes</Button>
                                    <Button onClick={() => setShowRemovePopover(false)} size="sm" variant="secondary">No</Button>
                                </Popover.Title>
                            <Popover.Content>
                                <p>Remove replacement?</p>
                                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 'auto', height: '2em'}}>
                                    <div>
                                        <strong>{currentToken}</strong> to <strong>{originalToken}</strong>
                                    </div>
                                </div>
                            </Popover.Content>
                        </Popover>

    const addSuggestedReplacement = async () => {
        const response = await axios.patch(`/api/token/suggestion-add/${tokenId}`, {suggested_replacement: suggestedToken});
        if (response.status === 200){
            console.log('succesfully added suggested replacement.');
            setSuggestedToken(null);
            setReplacedToken(suggestedToken);
            setCurrentToken(suggestedToken);
            setShowAddSuggestionPopover(false)
        }
    }

    const removeSuggestedReplacement = async () => {
        const response = await axios.delete(`/api/token/suggestion-remove/${tokenId}`);
        if (response.status === 200){
            console.log('succesfully removed suggested replacement.');
            setShowAddSuggestionPopover(false)
            setSuggestedToken(null);
        }
    }

    const addSuggestionPopover = <Popover id={`add-suggestion-popover`}>    
                                    <Popover.Title as="p" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '0.5em'}}>
                                            <Button onClick={() => addSuggestedReplacement()} size="sm" variant="info">Yes</Button>
                                            <Button onClick={() => removeSuggestedReplacement()} size="sm" variant="secondary">No</Button>
                                        </Popover.Title>
                                    <Popover.Content>
                                        <p>Add suggested replacement?</p>
                                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 'auto', height: '2em'}}>
                                            <div>
                                                <strong>{currentToken}</strong> to <strong>{suggestedToken}</strong>
                                            </div>
                                        </div>
                                    </Popover.Content>
                                    </Popover>



    const addAuxiliary = async (field, value) => {
        // Adds auxiliary label to tokens
        const response = await axios.patch(`/api/token/auxiliary/${tokenId}`, {field: field, value: value});

        if (response.status === 200){
            console.log('auxilliary updated successfully');
        }
    }

    const handleItemClick = (field) => {
        // Handles menu when auxiliary tags are requested
        console.log('menu action on aux field', field);
        addAuxiliary(field, !tokenInfo[field])
    }

    const displayMenu = (e) => {
        // TODO: Develop menu handler
        show(e);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.5em'}} key={tokenIndex}>
            <OverlayTrigger trigger="click" placement="bottom" overlay={addReplacementPopover} show={showPopover}>
                <input
                    type="text"
                    name="token"
                    placeholder={currentToken}
                    value={currentToken}
                    onChange={e => modifyToken(e.target.value)}
                    key={tokenIndex}
                    style={{backgroundColor: edited ? '#99BF9C': bgColor, width: inputWidth}}
                    className={classes.token}
                    autoComplete="off"
                    title={`original: ${originalToken}`}
                    onContextMenu={displayMenu}
                />
            </OverlayTrigger>

            {
                (( savedChange && originalToken !== currentToken && edited ) || replacedToken ) ?
                <OverlayTrigger trigger="click" placement="bottom" overlay={removeReplacementPopover} show={showRemovePopover}>
                    <div style={{cursor: 'pointer', width: inputWidth, backgroundColor: bgColorMap['rp'], height: '6px', borderRadius: '2px', marginTop: '2px', marginBottom: '0.5em'}} onClick={() => setShowRemovePopover(!showRemovePopover)}></div>
                </OverlayTrigger>
                : (suggestedToken)
                ?
                <OverlayTrigger trigger="click" placement="bottom" overlay={addSuggestionPopover} show={showAddSuggestionPopover}>
                    <div style={{cursor: 'pointer', width: inputWidth, backgroundColor: bgColorMap['sr'], height: '6px', borderRadius: '2px', marginTop: '2px', marginBottom: '0.5em'}} onClick={() => setShowAddSuggestionPopover(!showAddSuggestionPopover)}></div>
                </OverlayTrigger>
            : null

            }
            {/* TODO: Add english word here in the future... */}
            <Menu id={MENU_ID}>
                <Item style={{ backgroundColor: tokenInfo['domain_specific'] ? '#99BF9C': null}} onClick={() => handleItemClick("domain_specific")}>Domain Specific Term</Item>
                {/* <Separator/> */}
                <Item style={{ backgroundColor: tokenInfo['abbreviation'] ? '#99BF9C': null}} onClick={() => handleItemClick("abbreviation")}>
                Abbreviation
                </Item>
                <Item style={{ backgroundColor: tokenInfo['noise'] ? '#99BF9C': null}} onClick={() => handleItemClick("noise")}>
                Noise
                </Item>
                <Item style={{ backgroundColor: tokenInfo['english_word'] ? '#99BF9C': null}} onClick={() => handleItemClick("english_word")}>
                English Word
                </Item>
            </Menu>
        </div>
    )
}
