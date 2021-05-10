import React from 'react'
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    underline: {

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


    return (
        <div>
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
        </div>
    )
}
