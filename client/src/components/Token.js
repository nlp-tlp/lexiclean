// color palettee: medium blue: #6F87A6, light orange: #F2A477, light grey: #D9D9D9, light green: #99BF9C
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

// Color map for token classifications
const bgColorMap = {'en': '#D9D9D9', 'ds': '#D9D9D9', 'ua': '#F2A477'}

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
            setEdited(false);
            setShowPopover(false);
        }
    }, [value])

    const modifyToken = (targetValue) => {
        setShowPopover(true);
        setValue(targetValue);
    }

    const addToDict = () => {
        // console.log('text index', textIndex, 'token index', tokenIndex)
        // Get lexnorm dict values for text
        if (lexNormDict[textIndex] && Object.values(lexNormDict[textIndex]).length !== 0){
            // text exists in lexnormdict
            
            // Get current texts values
            const currentTextLexNorm = lexNormDict[textIndex]
            console.log('current text lexnorm', currentTextLexNorm)
            // Add additional inputs
            const updatedTextLexNorm = {...currentTextLexNorm, [tokenIndex]: {'source': originalToken, 'target': value}}
            console.log('updated lexnorm', updatedTextLexNorm)
            // Update lexnorm dict
            setLexNormDict(prevState => ({...prevState, [textIndex]: updatedTextLexNorm}))
        } else {
            // initial addition for text
            setLexNormDict(({...lexNormDict, [textIndex]: { [tokenIndex]: {'source': originalToken, 'target': value}}}),
            console.log('lexnormdict callback', lexNormDict))
        }

        setSavedChange(true);
        setShowPopover(false);
    }

    const cancelChange = () => {
        setValue(originalToken);
        setSavedChange(false);
    }

    const removeFromDict = () => {
        console.log('removing element from dict', lexNormDict);

        const filteredTextDict = Object.keys(lexNormDict[textIndex]).filter(key => key != tokenIndex)
                                                                    .reduce((obj, key) => {
                                                                        return {
                                                                            ...obj,
                                                                            [key]: lexNormDict[textIndex][key]
                                                                        };
                                                                    }, {})
        // console.log(filteredTextDict)

        setLexNormDict(prevState => ({...prevState, [textIndex]: filteredTextDict}))
        
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
                    style={{backgroundColor: edited ? '#99BF9C': bgColor, width: inputWidth}}
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
                    <div style={{cursor: 'pointer', width: inputWidth, backgroundColor: '#99BF9C', height: '6px', borderRadius: '2px', marginTop: '2px'}} onClick={() => setShowRemovePopover(true)}></div>
                </OverlayTrigger>
                : null
            }
        </div>
        </>
    )
}
