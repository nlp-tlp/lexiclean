// color palettee: dark grey: #6F87A6, light orange: #F2A477, light grey: #D9D9D9
import React, { useState, useEffect } from 'react'
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

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

const bgColorMap = {'en': '#D9D9D9', 'ds': '#D9D9D9', 'ua': '#6F87A6'}

export default function Token({tokenInfo, textIndex, lexNormDict, setLexNormDict}) {
    const classes = useStyles();

    const { index, token, classification } = tokenInfo;
    const tokenIndex = index;
    
    // const [currentTokenIndex] = useState(tokenIndex) 
    const [originalToken] = useState(token);
    const [value, setValue] = useState(token)
    const [edited, setEdited] = useState(false);
    const [savedChange, setSavedChange] = useState(false);
    const [bgColor, setBgColor] = useState(bgColorMap[classification])
    const [showPopover, setShowPopover] = useState(false);
    const [showRemovePopover, setShowRemovePopover] = useState(false);

    const [inputWidth, setInputWidth] = useState(`${(value.length + 2) * 8}px`)
    
    useEffect(() => {
        // Detect state change
        if(originalToken !== value){
            setEdited(true);
        } else {
            setEdited(false);
            setShowPopover(false);
        }
    }, [value])

    const modifyToken = (targetValue) => {
        setShowPopover(true);
        setValue(targetValue);
    }

    useEffect(() => {
        const minWidth = 50;
        const width = (value.length + 2) * 10
        if (width < minWidth){
            setInputWidth(`${minWidth}px`)
        } else {
            setInputWidth(`${width}px`)
        }
    }, [value])

    const addToDict = () => {
        // console.log('pair', originalToken, value)
        // console.log(lexNormDict);

        // Get lexnorm dict values for text
        if (lexNormDict[textIndex] && lexNormDict[textIndex].filter(text => text.index === textIndex).length !== 0){
            // text exists in lexnormdict
            console.log('t index', textIndex)
            console.log(Object.keys(lexNormDict).filter(text => text.index === textIndex))

        } else {
            // initial addition for text
            console.log(lexNormDict);
            setLexNormDict(prevState => ({...prevState, [textIndex]: [{ 'index': tokenIndex, 'norms': {source: originalToken, target: value}}]}))
        }

        setSavedChange(true);
        setShowPopover(false);
    }

    const cancelChange = () => {
        setValue(originalToken);
        setSavedChange(false);
    }

    const removeFromDict = () => {
        console.log(lexNormDict);
        setLexNormDict(prevState => ({...prevState, [textIndex]: prevState[textIndex].filter(token => token.index !== tokenIndex)}))
        setValue(originalToken);
        setShowRemovePopover(false);
        setEdited(false);

    }

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
                                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', margin: 'auto', height: '2em'}}>
                                    <div>
                                        <strong>{originalToken}</strong> to <strong>{value}</strong>
                                    </div>
                                </div>
                            </Popover.Content>
                        </Popover>

    return (
        <>
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
                    style={{backgroundColor: edited ? '#F2A477': bgColor, width: inputWidth}}
                    className={classes.token}
                    autocomplete="off"
                    title={`Original: ${originalToken}`}
                    />
            </OverlayTrigger>
            {
                (savedChange && originalToken !== value) ?
                <OverlayTrigger
                    trigger="click"
                    placement="bottom"
                    overlay={removePopover}
                    show={showRemovePopover}
                >
                    <div style={{cursor: 'pointer', width: inputWidth, backgroundColor: '#F2A477', height: '6px', borderRadius: '2px', marginTop: '2px'}} onClick={() => setShowRemovePopover(true)}></div>
                </OverlayTrigger>
                : null
            }
        </div>
        </>
    )
}
