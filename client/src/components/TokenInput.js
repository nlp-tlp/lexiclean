import React from 'react'
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

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

export default function TokenInput({showContextMenu, showPopover, tokenIndex, modifyToken, edited, bgColor, inputWidth, addReplacement, cancelChange, originalToken, currentToken}) {
    const classes = useStyles();

    const addReplacementPopover = <Popover
                                    id={`popover`}
                                    onKeyDown={(event) => console.log(event)}
                                    >
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


    return (
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
            onContextMenu={(e) => showContextMenu(e)}
        />
    </OverlayTrigger>
    )
}
