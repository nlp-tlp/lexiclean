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
const bgColorMap = {'en': '#D9D9D9', 'ds': '#D9D9D9', 'ua': '#F2A477', 'rp': '#99BF9C'}

export default function Token({tokenInfo, textIndex, lexNormDict, setLexNormDict, replacementMap, setReplacementMap}) {
    const classes = useStyles();
    const MENU_ID = `menu-${textIndex}`;

    const { show } = useContextMenu({
        id: MENU_ID,
      });


    const { index, token, classification, original } = tokenInfo;
    const tokenIndex = index;
    const replacedToken = classification === 'rp';

    // const [currentTokenIndex] = useState(tokenIndex) 
    const [originalToken] = useState(original);
    const [value, setValue] = useState(token)
    const [edited, setEdited] = useState(false);
    const [savedChange, setSavedChange] = useState(false);
    const [bgColor, setBgColor] = useState(bgColorMap[classification])
    const [showPopover, setShowPopover] = useState(false);
    const [showRemovePopover, setShowRemovePopover] = useState(false);

    const [inputWidth, setInputWidth] = useState(`${(value.length + 2) * 8}px`)
    

    
    useEffect(() => {
        // Set input field width
        const minWidth = 50;
        const width = (value.length + 2) * 10
        if (width < minWidth){
            setInputWidth(`${minWidth}px`)
        } else {
            setInputWidth(`${width}px`)
        }
    }, [value])


    useEffect(() => {
        // Detect state change
        if(originalToken !== value){
            setEdited(true);
        } else {
            // Remove from dictionary if the value is reverted to its original form
            setEdited(false);
            setShowPopover(false);
        }
    }, [value])

    const modifyToken = (targetValue) => {
        setShowPopover(true);
        setValue(targetValue);
    }

    const addReplacement = async () => {

        const response = await axios.post('/api/data/')

    }

    const addToDict = () => {
        // console.log(originalToken, value, tokenInfo._id)

        setLexNormDict(prevState => ({...prevState, [tokenInfo._id]: {"replacement_token": value, "doc_id": textIndex}}))
        setSavedChange(true);
        setShowPopover(false);

    }

    const removeFromDict = async () => {
        // console.log('removing', value, 'from dictionary')
        if (tokenInfo.classification === 'rp'){
            console.log(replacementMap);
            console.log(tokenInfo)
            console.log(value);
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
        
        setValue(originalToken);
        setShowRemovePopover(false);
        setEdited(false);
    }

    const cancelChange = () => {
        setValue(originalToken);
        setSavedChange(false);
    }

    useEffect(() => {
        console.log('hi')
        // This triggers a render event otherwise tokens get frozen...
        // console.log(lexNormDict)
    }, [lexNormDict])

    const dictPopover = <Popover id={`popover`}>
                            <Popover.Title as="p" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '0.5em'}}>
                                    <Button onClick={() => addToDict()} size="sm" variant="info">Yes</Button>
                                    <Button onClick={() => cancelChange()} size="sm" variant="secondary">No</Button>
                                </Popover.Title>
                            <Popover.Content>
                                <p>Add to dictionary?</p>
                                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 'auto', height: '2em'}}>
                                    <div>
                                        <strong>{originalToken}</strong> to <strong>{value}</strong>
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
                                            <strong>{originalToken}</strong> to <strong>{value}</strong>
                                        </div>
                                    </div>
                                }
                            </Popover.Content>
                        </Popover>

    const handleItemClick = ({ e, props, triggerEvent, data }) => {
        // TODO: Develop click handler
        // console.log(e, props, triggerEvent, data );
        console.log('Menu clicked')
    }

    const displayMenu = (e) => {
        // TODO: Develop menu handler
        show(e);
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <OverlayTrigger
            trigger="click"
                placement="bottom"
                overlay={dictPopover}
                show={showPopover}
                >
                <input
                    type="text"
                    name="token"
                    placeholder={value}
                    value={value}
                    onChange={e => modifyToken(e.target.value)}
                    key={tokenIndex}
                    style={{backgroundColor: edited ? '#99BF9C': bgColor, width: inputWidth}}
                    className={classes.token}
                    autocomplete="off"
                    title={`Original: ${originalToken}`}
                    onContextMenu={displayMenu}
                    />
            </OverlayTrigger>

            {
                ((savedChange && originalToken !== value && edited) || replacedToken) ?
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
            <Menu id={MENU_ID}>
                <Item onClick={handleItemClick}>Domain Specific Term</Item>
                {/* <Separator/> */}
                <Item onClick={handleItemClick}>
                Abbreviation
                </Item>
                <Item onClick={handleItemClick}>
                Noise
                </Item>
            </Menu>
        </div>
    )
}
