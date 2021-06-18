import React from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { MdDelete, MdBrush, MdBookmark } from 'react-icons/md'
import { BsArrowRightShort } from 'react-icons/bs'

const useStyles = createUseStyles({
    popoverContainer: {
        minWidth: '120px',
    },
    textContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        borderBottom: '1px solid lightgrey',
        padding: '0.5em 0.5em 0em 0.5em',
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
        textAlign: 'center',
        padding: '0em 0.5em 0em 0.5em'
    }
})

export default function TokenUnderline({ changeTrigger,
                                         originalToken,
                                         currentToken,
                                         edited,
                                         replacedToken,
                                         removeReplacement,
                                         showRemovePopover,
                                         setShowRemovePopover,
                                         inputWidth,
                                         bgColourMap,
                                         suggestedToken,
                                         showAddSuggestionPopover,
                                         setShowAddSuggestionPopover,
                                         addSuggestedReplacement,
                                         removeSuggestedReplacement
                                        }) {

    const classes = useStyles();

    const addOne = () => {
        addSuggestedReplacement();
    }

    const addAll = () => {
        addSuggestedReplacement();
    }

    const ignore = () => {
        removeSuggestedReplacement();
    }

    const remove = () => {
        removeReplacement();
    }
    
    const removeReplacementPopover = <Popover id={`remove-popover`}>
                                        <div className={classes.popoverContainer}>
                                            <div className={classes.textContainer}>
                                                <p className={classes.originalText}>{originalToken}</p>
                                                <p className={classes.arrow}><BsArrowRightShort/></p>
                                                <p className={classes.suggestedTextSingle}>{currentToken}</p>
                                            </div>
                                            <div className={classes.actionContainer}>
                                                <div
                                                    className={classes.actionBtnActive}
                                                    onClick={() => remove()}
                                                >
                                                    <p
                                                        className={classes.actionText}
                                                    >
                                                        <MdDelete/>Remove
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Popover>

    const addSuggestionPopover = <Popover id={`add-suggestion-popover`}
                                    onKeyDown={(event) => console.log(event)}
                                    >
                                    <div className={classes.popoverContainer}>
                                        <div className={classes.textContainer}>
                                            <p className={classes.originalText}>{originalToken}</p>
                                            <p className={classes.arrow}><BsArrowRightShort/></p>
                                            <p className={classes.suggestedTextSingle}>{currentToken}</p>
                                        </div>
                                        <div className={classes.actionContainer}>
                                            <div className={classes.actionBtnActive} onClick={() => addOne()}><p className={classes.actionText}><MdBookmark/>Accept</p></div>
                                            <div className={classes.actionBtnActive} onClick={() => addAll()}><p className={classes.actionText}><MdBrush/>Accept all</p></div>
                                            <div className={classes.actionBtnActive} onClick={() => ignore()}><p className={classes.actionText}><MdDelete/>Ignore</p></div>
                                        </div>
                                    </div>
                                </Popover>


    return (
        <div>
            {
                (( originalToken !== currentToken && edited ) || replacedToken ) ?  // Note: earlier this had savedChange (changed to changeTrigger) boolean on true, this doesnt work anymore...
                <OverlayTrigger
                    trigger="focus"
                    placement="bottom"
                    overlay={removeReplacementPopover}
                    show={showRemovePopover}
                >
                    <div
                        style={{cursor: 'pointer', width: inputWidth, backgroundColor: bgColourMap['rp'], height: '6px', borderRadius: '2px', marginTop: '2px', marginBottom: '0.5em'}}
                        onClick={() => setShowRemovePopover(!showRemovePopover)}
                    />
                </OverlayTrigger>
                : (suggestedToken)
                ?
                <OverlayTrigger
                    trigger="focus"
                    placement="bottom"
                    overlay={addSuggestionPopover}
                    show={showAddSuggestionPopover}
                >
                    <div
                        style={{cursor: 'pointer', width: inputWidth, backgroundColor: bgColourMap['st'], height: '6px', borderRadius: '2px', marginTop: '2px', marginBottom: '0.5em'}}
                        onClick={() => setShowAddSuggestionPopover(!showAddSuggestionPopover)}
                    />
                </OverlayTrigger>
                : null
            }
        </div>
    )
}
