import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { createUseStyles } from 'react-jss';
import {ErrorBoundary} from 'react-error-boundary';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { IoInformationCircleSharp } from 'react-icons/io5';
import TokenizeGif from '../common/media/tokenize.gif';

const useStyles = createUseStyles({
    tokenizeContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    tokensContainer: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    token: {
        padding: '0.5em',
        marginRight: '0.5em',
        marginBottom: '0.5em',
        border: 'none',
        verticalAlign: 'center',
        textAlign: 'center',
        borderRadius: '4px',
        '&:hover': {
            opacity: '0.8'
        }
    },
    actionContainer: {
        marginTop: '0.5em',
        maxWidth: '200px',
        display: 'flex',
        justifyContent: 'space-around',
        marginRight: 'auto'
    },
    actionButton: {
         display:'inline-block',
         padding:'0.1em 1em',
         margin:'0.1em',
         border:'0.1em solid lightgrey',
         boxSizing: 'border-box',
         textDecoration:'none',
         textAlign:'center',
         color:'white',
         backgroundColor:'grey',
        marginRight: '0.5em',
        '&:hover': {
            opacity: '0.8',
            color:'white',
            backgroundColor:'grey',
            border:'0.1em solid lightgrey',
        },
        '&:disabled': {
            opacity: '0.2',
            color:'grey',
            backgroundColor:'lightgrey',
            border:'0.1em solid grey',
        }
    },
})

const MIN_TOKEN_WIDTH = 60; // px

export default function Tokenize({ project, textIntermediate, setTextIntermediate }) {

    const classes = useStyles();

    const [tokenIndexes, setTokenIndexes] = useState(new Set());
    const [tokenIndexGroups, setTokenIndexGroups] = useState([]);
    const [valid, setValid] = useState(false);


    // const undoText = async () => {
    //     const response = await axios.patch('/api/text/tokenize/undo', { text_id: textIntermediate._id });
    //     if (response.status === 200){
    //         setTextIntermediate(response.data);
    //         setTextString(originalText);
    //     }
    // }

    const ErrorHandler = () => {
        return (
            <div>
                <p>Something went wrong...</p>
            </div>
        )
    }


    const handleIndex = (index) => {
        if( tokenIndexes.has(index)) {
            setTokenIndexes(prev => new Set([...prev].filter(x => x !== index)))
        } else {
            setTokenIndexes(prev => new Set(prev.add(index)))
        }
    }

    const clearTokens = () => {
        // Removes last selection from selected tokens
        setTokenIndexes(new Set());
    }


    useEffect(() => {
        const indexes = Array.from(tokenIndexes).sort((a,b) => {return a - b});
        const groups = indexes.reduce((r, n) => {
            // https://stackoverflow.com/questions/47906850/javascript-group-the-numbers-from-an-array-with-series-of-consecutive-numbers
            const lastSubArray = r[r.length - 1];    
            if(!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
                r.push([]);
            } 
            r[r.length - 1].push(n);
            return r;  
            }, []);
        setTokenIndexGroups(groups);
        // Check all sub arrays are greater than 1 in length
        const validSelection = groups.filter(l => l.length === 1).length === 0;
        setValid(validSelection)
    }, [tokenIndexes])


    const applyTokens = async () => {
        if (valid){
            // Get tokens to change (tc) and to keep (tk)
            const textIndexes = new Set(textIntermediate.tokens.map(token => token.index));
            const tokenIndexesTK = new Set([...textIndexes].filter(x => !tokenIndexes.has(x)))
            const response = await axios.patch('/api/text/tokenize', { text_id: textIntermediate._id, project_id: project._id, index_groups_tc:  Array.from(tokenIndexGroups), indexes_tk: Array.from(tokenIndexesTK)});
            if (response.status === 200){
                console.log(response.data);
                setTextIntermediate(response.data);
                setTokenIndexes(new Set());
            }
        }
    }

    const infoPopover = (
        <Popover id="popover-info">
          <Popover.Title as="h3">Tokenization Help</Popover.Title>
          <Popover.Content>
            <img src={TokenizeGif} alt="tokenization gif" width="200px"/>
          </Popover.Content>
        </Popover>
        )
    
    return (
        <ErrorBoundary FallbackComponent={ErrorHandler} >
            <div className={classes.tokenizeContainer}>
                <div className={classes.tokensContainer}>
                    {

                    textIntermediate.tokens.map(token => {
                        return(
                            <div
                                className={classes.token}
                                style={{backgroundColor: tokenIndexes.has(token.index) ? '#BFE3BF' : '#fdfd96', width: (token.value.length + 2) * 10 < MIN_TOKEN_WIDTH ? `${MIN_TOKEN_WIDTH}px` : `${(token.value.length + 2) * 10}px`}}
                                onClick={() => handleIndex(token.index)}
                            >
                            {token.value}
                            </div>
                            )
                        })
                    }
                </div>

                <div className={classes.actionContainer}>
                    <Button
                        className={classes.actionButton}
                        disabled={tokenIndexes.size <= 1 || !valid}
                        onClick={applyTokens}
                        size="sm"
                    >
                        Apply
                    </Button>
                    {/* <button>Apply All</button> */}
                    <Button
                        className={classes.actionButton}
                        onClick={clearTokens}
                        disabled={tokenIndexes.size === 0}
                        size="sm"
                    >
                        Clear
                    </Button>

                    <OverlayTrigger
                        trigger="click"
                        placement="right"
                        overlay={infoPopover}
                    >
                        <IoInformationCircleSharp style={{marginLeft: '2px', color: 'grey'}} />
                    </OverlayTrigger>
                </div>
            </div>
        </ErrorBoundary>
    )
}
