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
        borderRadius: '4px'
    }
})


// Color map for token classifications
const bgColorMap = { 'ds_abrv_en': '#D9D9D9', 'ua': '#F2A477', 'rp': '#99BF9C'}

export default function Token({tokenInfo, textIndex, lexNormDict, setLexNormDict, replacementMap, setReplacementMap}) {
    const classes = useStyles();
    const { index, value, classification } = tokenInfo;
    const tokenId = tokenInfo.token;
    const tokenIndex = index;
    const replacedToken = tokenInfo.replacement;

    const MENU_ID = `menu-${tokenIndex}`;
    const { show } = useContextMenu({ id: MENU_ID });


    
    const [originalToken] = useState(value);
    const [currentToken, setCurrentToken] = useState(replacedToken ? replacedToken : value); // Populate with replaced token if its available
    const [edited, setEdited] = useState(false);
    const [savedChange, setSavedChange] = useState(false);
    
    // Specify colour of token
    const tokenClassification = (tokenInfo.domain_specific || tokenInfo.abbreviation || tokenInfo.english_word) ? 'ds_abrv_en' : tokenInfo.replacement ? 'rp' : 'ua';
    const [bgColor, setBgColor] = useState(bgColorMap[tokenClassification])

    const [showPopover, setShowPopover] = useState(false);
    const [showRemovePopover, setShowRemovePopover] = useState(false);

    const [inputWidth, setInputWidth] = useState(`${(currentToken.length + 2) * 8}px`)
    
    
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

    const modifyToken = (targetValue) => {
        setShowPopover(true);
        setCurrentToken(targetValue);
    }

    const addToDict = async () => {
        console.log(originalToken, currentToken, tokenInfo)

        const response = await axios.patch(`/api/token/replace/${tokenId}`, {replacement: currentToken});

        if (response.status === 200){
            console.log('replacement response', response);
            setLexNormDict(prevState => ({...prevState, [tokenInfo._id]: {"replacement_token": currentToken, "doc_id": textIndex}}))
            setSavedChange(true);
            setShowPopover(false);
        }


    }

    const removeFromDict = async () => {
        // console.log('removing', currentToken, 'from dictionary')
        if (tokenInfo.classification === 'rp'){
            console.log(replacementMap);
            console.log(tokenInfo)
            console.log(currentToken);
            // Token was automatically replaced -> need to delete from database
            const response = await axios.delete(`/api/results/${tokenInfo._id}`)
            if (response.status === 200){
                console.log('successfully deleted result')
                console.log(response);
            }
        } else {
            // https://stackoverflow.com/questions/38750705/filter-object-properties-by-key-in-es6
            const filteredLexNormDict = Object.keys(lexNormDict).filter(key => key !== tokenInfo._id)
                                                                .reduce((obj, key) => {
                                                                    return {
                                                                        ...obj,
                                                                        [key]: lexNormDict[key]
                                                                    };
                                                                }, {})
            setLexNormDict(filteredLexNormDict)
        }
        
        setCurrentToken(originalToken);
        setShowRemovePopover(false);
        setEdited(false);
    }

    const cancelChange = () => {
        setCurrentToken(originalToken);
        setSavedChange(false);
    }

    // useEffect(() => {
    //     // console.log('hi')
    //     // This triggers a render event otherwise tokens get frozen...
    //     console.log(lexNormDict)

    // }, [lexNormDict])

    const dictPopover = <Popover id={`popover`}>
                            <Popover.Title as="p" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '0.5em'}}>
                                    <Button onClick={() => addToDict()} size="sm" variant="info">Yes</Button>
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
    
    const removePopover = <Popover id={`remove-popover`}>
                            <Popover.Title as="p" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '0.5em'}}>
                                    <Button onClick={() => removeFromDict()} size="sm" variant="info">Yes</Button>
                                    <Button onClick={() => setShowRemovePopover(false)} size="sm" variant="secondary">No</Button>
                                </Popover.Title>
                            <Popover.Content>
                                <p>Remove from dictionary?</p>
                                {
                                    replacedToken ? null :
                                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 'auto', height: '2em'}}>
                                        <div>
                                            <strong>{originalToken}</strong> to <strong>{currentToken}</strong>
                                        </div>
                                    </div>
                                }
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
        // TODO: review how the menu is being populated as it appears it may be modifying the wrong tokens
        console.log('menu- aux field', field);
        addAuxiliary(field, !tokenInfo[field])

    }

    const displayMenu = (e) => {
        // TODO: Develop menu handler
        show(e);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }} key={tokenIndex}>
            <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={dictPopover}
                show={showPopover}
            >
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
                    title={`Original: ${originalToken}`}
                    onContextMenu={displayMenu}
                    />
            </OverlayTrigger>

            {
                (( savedChange && originalToken !== currentToken && edited ) || replacedToken ) ?
                <OverlayTrigger
                    trigger="click"
                    placement="bottom"
                    overlay={removePopover}
                    show={showRemovePopover}
                    >
                    <div
                    style={{cursor: 'pointer', width: inputWidth, backgroundColor: '#99BF9C', height: '6px', borderRadius: '2px', marginTop: '2px'}}
                    onClick={() => setShowRemovePopover(true)}
                    ></div>
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
            </Menu>
        </div>
    )
}
