import React from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { MdDelete, MdBrush, MdBookmark } from 'react-icons/md'
import { BsArrowRightShort } from 'react-icons/bs'


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
    },
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
    suggestedText: {
        backgroundColor: '#99BF9C',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '4px',
        borderRadius: '4px',
    },
    actionContainer: {
    },
    actionBtn: {
        fontSize: '16px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'lightgrey'
        }
    },
    actionText: {
        margin: '0.2em 0 0.2em 0',
        textAlign: 'center'
    }
})

export default function TokenInput({showContextMenu,
                                    showPopover,
                                    tokenIndex,
                                    modifyToken,
                                    edited,
                                    bgColour,
                                    inputWidth,
                                    addReplacement,
                                    cancelChange,
                                    originalToken,
                                    currentToken,
                                    bgColourMap,
                                    tokenClf,
                                    replacedToken
                                }) {
    const classes = useStyles();

    const addOne = () => {
        addReplacement(true);
    }

    const addAll = () => {
        addReplacement(false);
    }

    const ignore = () => {
        cancelChange();
    }

    const addReplacementPopover = <Popover
                                    id={`popover`}
                                    onKeyDown={(event) => console.log(event)}
                                    >
                                    <div className={classes.popoverContainer}>
                                        <div className={classes.textContainer}>
                                            <p className={classes.originalText}>{originalToken}</p>
                                            <p className={classes.arrow}><BsArrowRightShort/></p>
                                            <p className={classes.suggestedText}>{currentToken}</p>
                                        </div>
                                        <div className={classes.actionContainer}>
                                            <div className={classes.actionBtn} onClick={() => addOne()}><p className={classes.actionText}><MdBookmark/>Apply</p></div>
                                            <div className={classes.actionBtn} onClick={() => addAll()}><p className={classes.actionText}><MdBrush/>Apply all</p></div>
                                            <div className={classes.actionBtn} onClick={() => ignore()}><p className={classes.actionText}><MdDelete/>Ignore</p></div>
                                        </div>
                                    </div>
                                </Popover>

    return (
        <OverlayTrigger
            trigger = "click"
            placement="bottom"
            overlay={addReplacementPopover}
            show={showPopover}
        >
        <input
            type="text"
            name="token"
            placeholder={currentToken}
            value={currentToken}
            onChange={e => modifyToken(e.target.value)}
            key={tokenIndex}
            // Style - if token is edited (user modified token in place so show as green), if original token and current token are different 
            //         then the token has been modified due to a suggestion so colour accordingly.
            // TODO: make meta-tag override input colour (replace/suggest will be indicated by underline colour)
            style={{ backgroundColor: (edited || replacedToken) ? bgColourMap['rp']: ( originalToken !== currentToken ) ? bgColourMap['st'] : bgColour, width: inputWidth}}
            className={classes.token}
            autoComplete="off"
            title={`original: ${originalToken}\nClass: ${tokenClf}`}
            onContextMenu={(e) => showContextMenu(e)}
        />
    </OverlayTrigger>
    )
}
