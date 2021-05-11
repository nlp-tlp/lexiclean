import React, { useState, useEffect } from 'react'
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { MdDelete, MdBrush, MdBookmark } from 'react-icons/md'
import { BsArrowRightShort } from 'react-icons/bs'

const useStyles = createUseStyles({
    popoverContainer: {
        minWidth: '120px',
        padding: '0.5em',
    },
    textContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        borderBottom: '1px solid lightgrey'
    },
    originalText: {
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '4px',
        borderRadius: '4px',
        verticalAlign: 'middle',
        textDecoration: 'line-through 3px rgba(191, 88, 78, 0.5)' //light red: #BF584E
    },
    arrow: {
        fontSize: '22px',
        fontWeight: 'bold'
    },
    suggestedTextMultiple: {
        backgroundColor: 'lightgrey',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '4px',
        borderRadius: '4px',
        '&:hover': {
            backgroundColor: '#99BF9C',
            cursor: 'pointer'
        }
    },
    suggestedTextSingle: {
        backgroundColor: '#99BF9C',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '4px',
        borderRadius: '4px',
    },
    actionContainer: {
        fontSize: '16px',
        cursor: 'pointer',
    },
    actionBtnDisabled: {
        color: 'lightgrey',
        cursor: 'alias',
    },
    actionBtnActive: {
        '&:hover': {
            backgroundColor: 'lightgrey'
        }
    },
    actionText: {
        margin: '0.2em 0 0.2em 0',
        textAlign: 'center'
    }
})

export default function TokenUnderline({ savedChange,
                                         originalToken,
                                         currentToken,
                                         edited,
                                         replacedToken,
                                         removeReplacement,
                                         showRemovePopover,
                                         setShowRemovePopover,
                                         inputWidth,
                                         bgColorMap,
                                         suggestedToken,
                                         showAddSuggestionPopover,
                                         setShowAddSuggestionPopover,
                                         addSuggestedReplacement,
                                         removeSuggestedReplacement}) {

    const classes = useStyles();

    const [multipleSuggestions, setMultipleSuggestions] = useState();
    const [selectedSuggestion, setSelectedSuggestion] = useState();
    
    useEffect(() => {
        if (suggestedToken){
            setMultipleSuggestions(suggestedToken.length > 1)
        }   
    }, [])

    const addOne = () => {
        // TODO: Make this not cascade
        addSuggestedReplacement();
    }

    const addAll = () => {
        addSuggestedReplacement();
    }

    const ignore = () => {
        removeSuggestedReplacement();

    }
    
    console.log(originalToken, suggestedToken)

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

    const addSuggestionPopover = <Popover id={`add-suggestion-popover`}
                                    onKeyDown={(event) => console.log(event)}
                                    >
                                    <div className={classes.popoverContainer}>
                                        <div className={classes.textContainer}>
                                            <p className={classes.originalText}>{originalToken}</p>
                                            
                                            {
                                                (suggestedToken && multipleSuggestions) ?
                                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                                    {suggestedToken.map(suggestion => {return(
                                                        <>
                                                        <div style={{display: 'flex'}}>
                                                            <p className={classes.arrow}><BsArrowRightShort/></p>
                                                            <p 
                                                                className={classes.suggestedTextMultiple}
                                                                onClick={() => setSelectedSuggestion(selectedSuggestion === suggestion ? null : suggestion)}
                                                                style={{backgroundColor: selectedSuggestion === suggestion ? '#99BF9C' : null}}
                                                            >
                                                                {suggestion}
                                                            </p>
                                                        </div>
                                                        </>
                                                    )})
                                                    }
                                                </div>
                                                :
                                                <>
                                                <p className={classes.arrow}><BsArrowRightShort/></p>
                                                <p className={classes.suggestedTextSingle}>{currentToken}</p>
                                                </>
                                            }
                                        </div>
                                        <div className={classes.actionContainer}>
                                            <div className={(selectedSuggestion || !multipleSuggestions) ? classes.actionBtnActive : classes.actionBtnDisabled} onClick={() => addOne()}><p className={classes.actionText}><MdBookmark/>Add one</p></div>
                                            <div className={(selectedSuggestion || !multipleSuggestions) ? classes.actionBtnActive : classes.actionBtnDisabled} onClick={() => addAll()}><p className={classes.actionText}><MdBrush/>Apply all</p></div>
                                            <div className={(selectedSuggestion || !multipleSuggestions) ? classes.actionBtnActive : classes.actionBtnDisabled} onClick={() => ignore()}><p className={classes.actionText}><MdDelete/>Ignore</p></div>
                                        </div>
                                    </div>
                                </Popover>


    return (
        <div>
            {
                (( savedChange && originalToken !== currentToken && edited ) || replacedToken ) ?
                <OverlayTrigger trigger="click" placement="bottom" overlay={removeReplacementPopover} show={showRemovePopover}>
                    <div
                        style={{cursor: 'pointer', width: inputWidth, backgroundColor: bgColorMap['rt'], height: '6px', borderRadius: '2px', marginTop: '2px', marginBottom: '0.5em'}}
                        onClick={() => setShowRemovePopover(!showRemovePopover)}
                    />
                </OverlayTrigger>
                : (suggestedToken)
                ?
                <OverlayTrigger trigger="click" placement="bottom" overlay={addSuggestionPopover} show={showAddSuggestionPopover}>
                    <div
                        style={{cursor: 'pointer', width: inputWidth, backgroundColor: bgColorMap['st'], height: '6px', borderRadius: '2px', marginTop: '2px', marginBottom: '0.5em'}}
                        onClick={() => setShowAddSuggestionPopover(!showAddSuggestionPopover)}
                    />
                </OverlayTrigger>
                : null
            }
        </div>
    )
}
