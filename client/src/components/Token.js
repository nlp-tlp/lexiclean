// color palettee: medium blue: #6F87A6, light orange: #F2A477, light grey: #D9D9D9, light green: #99BF9C, light purple: #8F8EBF
import React, { useState, useEffect } from 'react'
import { useContextMenu } from "react-contexify";
import { createUseStyles } from 'react-jss';
import axios from 'axios';

import ContextMenu from './utils/ContextMenu';
import TokenInput from './TokenInput';
import TokenUnderline from './TokenUnderline';

const useStyles = createUseStyles({
    tokenCircle: {
        width: '6px',
        height: '6px',
        backgroundColor: '#8F8EBF',
        marginLeft: '0.25em',
        borderRadius: '50%',
        marginTop: '2px',
        marginBottom: '0.5em',
        '&:hover': {
            opacity: '0.8'
        }
    }
})

// Color map for token classifications
// ua - unassigned, rp - replacement, sr - suggested replacemtn
const bgColorMap = {
    'ds': 'red',
    'ab': 'purple',
    'ew': '#D9D9D9',
    'no': 'blue',
    'un': 'brown', 
    'rp': 'yellow',
    'rt': '#99BF9C',
    'st': '#6BB0BF',
    'ua': '#F2A477',
}

export default function Token({tokenInfo, textIndex, replacementDict, setReplacementDict, metaTagSuggestionMap, setMetaTagSuggestionMap}) {
    const classes = useStyles();

    // Token
    const { index, value } = tokenInfo;
    const tokenId = tokenInfo.token;
    const tokenIndex = index;
    const [originalToken] = useState(value);
    const [replacedToken, setReplacedToken] = useState(tokenInfo.replacement);
    const [suggestedToken, setSuggestedToken] = useState(tokenInfo.suggested_replacement);
    const [currentToken, setCurrentToken] = useState(replacedToken ? replacedToken : suggestedToken ? suggestedToken : value); // Populate with replaced token if its available
    
    // Token classification and colouring
    const [tokenClf, setTokenClf] = useState();
    const [bgColor, setBgColor] = useState()
    
    // Meta Tag
    const [hasSuggestedMetaTag, setHasSuggestedMetaTag] = useState(tokenInfo.suggested_meta_tag ? Object.keys(tokenInfo.suggested_meta_tag).length > 0 : null);
    
    // Menu
    const MENU_ID = `menu-${textIndex}-${tokenIndex}`;
    const { show: showContextMenu } = useContextMenu({ id: MENU_ID });
    
    // User interaction
    const [edited, setEdited] = useState(false);
    const [savedChange, setSavedChange] = useState(false);
    const [inputWidth, setInputWidth] = useState(`${(currentToken.length + 2) * 8}px`)  // dynamically changes input width based on text value
    
    // Popover Controllers
    const [showPopover, setShowPopover] = useState(false);
    const [showRemovePopover, setShowRemovePopover] = useState(false);
    const [showAddSuggestionPopover, setShowAddSuggestionPopover] = useState(false);


    useEffect(() => {
        // Updates token colour based on state of token information and subsequent classification
        // TODO: update with something better
        if (tokenInfo.domain_specific){
            setTokenClf('ds')
        } else if (tokenInfo.abbreviation){
            setTokenClf('ab')
    
        } else if (tokenInfo.english_word){
            setTokenClf('ew')
    
        } else if (tokenInfo.noise){
            setTokenClf('no')
    
        } else if (tokenInfo.unsure){
            setTokenClf('un')
    
        } else if (replacedToken){
            setTokenClf('rt')
    
        } else if (suggestedToken){
            setTokenClf('st')
        
        } else {
            setTokenClf('ua')
        }
        setBgColor(bgColorMap[tokenClf])

    }, [tokenClf, bgColorMap, replacedToken, suggestedToken, tokenInfo, hasSuggestedMetaTag, metaTagSuggestionMap])
    
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
        if( originalToken !== currentToken && suggestedToken !== currentToken){
            // Checks whether the token has been edited by user or if the token value has changed due to a suggestion.
            setEdited(true);
        } else {
            // Remove from dictionary if the currentToken is reverted to its original form
            setEdited(false);
            setShowPopover(false);
        }
    }, [currentToken])

    useEffect(() => {
        // Updates suggested token based on replacment dictionary content
        if(Object.keys(replacementDict).includes(currentToken)){
            setSuggestedToken(replacementDict[currentToken])
            setCurrentToken(replacementDict[currentToken])
        }

    }, [replacementDict])

    const modifyToken = (targetValue) => {
        setShowPopover(true);
        setCurrentToken(targetValue);
    }

    const addReplacement = async () => {
        const response = await axios.patch(`/api/token/replace/${tokenId}`, {replacement: currentToken});
        if (response.status === 200){
            console.log('replacement response', response);
            setSavedChange(true);
            setShowPopover(false);

            // Add replacement to replacementDict (used to update other tokens)
            setReplacementDict(prevState => ({...prevState, [originalToken]: currentToken}));

        }
    }

    const removeReplacement = async () => {
        const response = await axios.delete(`/api/token/replace-remove/${tokenId}`)
        if (response.status === 200){
            console.log('Replacement was successfully removed.')
            setCurrentToken(originalToken);
            setShowRemovePopover(false);
            setSavedChange(false);
            setReplacedToken(null);
            setEdited(false);

            // Remove replacement from dictionary (used to update other tokens)
            setReplacementDict(Object.keys(replacementDict).filter(token => token !== originalToken));
        }
    }

    const cancelChange = () => {
        // Cancel of dictionary add action
        if (suggestedToken){
            setCurrentToken(suggestedToken);
        } else {
            setCurrentToken(originalToken);
        }
        setSavedChange(false);
    }

    const addSuggestedReplacement = async () => {
        const response = await axios.patch(`/api/token/suggestion-add/${tokenId}`, {suggested_replacement: suggestedToken});
        if (response.status === 200){
            console.log('succesfully added suggested replacement.');
            setSuggestedToken(null);
            setReplacedToken(suggestedToken);
            setCurrentToken(suggestedToken);
            setShowAddSuggestionPopover(false)
        }
    }

    const removeSuggestedReplacement = async () => {
        const response = await axios.delete(`/api/token/suggestion-remove/${tokenId}`);
        if (response.status === 200){
            console.log('succesfully removed suggested replacement.');
            setShowAddSuggestionPopover(false)
            setSuggestedToken(null);
            setCurrentToken(originalToken);
        }
    }


    // --- Meta Tag Logic 
    useEffect(() => {
        // Updates suggested meta tag based on meta tag suggestion map content
        
        // Check if current token exists in any of the sub-maps (first checks if metatag map is initialised)
        // TODO: currently testing with domain_specific... will do similar process for all sub-maps in the future.
        if(Object.keys(metaTagSuggestionMap["domain_specific"]).includes(currentToken)){
            console.log('Suggested meta tag for domain_specific exists');
            setHasSuggestedMetaTag(true);
        }
    
    }, [metaTagSuggestionMap])

    const addMetaTag = async (field, value) => {
        // Adds auxiliary label to tokens
        const response = await axios.patch(`/api/token/auxiliary/${tokenId}`, {field: field, value: value});

        if (response.status === 200){
            console.log('auxilliary updated successfully');

            // Add meta tag to suggestion map
            const subMetaTagMap = metaTagSuggestionMap[field]
            console.log('sub meta map', subMetaTagMap)
            const subMetaTagMapUpdated = {...metaTagSuggestionMap[field], [currentToken]: value}
            console.log('sub meta map updated', subMetaTagMapUpdated)

            // {...metaTagSuggestionMap[field], }
            setMetaTagSuggestionMap(prevState => ({...prevState, [field]: subMetaTagMapUpdated}))


        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.5em'}} key={tokenIndex} id={`token-${tokenClf}`}>
            {
                tokenClf ?
                <>
                <TokenInput
                    showContextMenu={showContextMenu}
                    showPopover={showPopover}
                    tokenIndex={tokenIndex}
                    modifyToken={modifyToken}
                    edited={edited}
                    bgColor={bgColor}
                    inputWidth={inputWidth}
                    addReplacement={addReplacement}
                    cancelChange={cancelChange}
                    originalToken={originalToken}
                    currentToken={currentToken}
                    bgColorMap={bgColorMap}
                />
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: (hasSuggestedMetaTag && !suggestedToken) ? 'space-between' : null, width: inputWidth}}>
                    <TokenUnderline
                        savedChange={savedChange}
                        originalToken={originalToken}
                        currentToken={currentToken}
                        edited={edited}
                        replacedToken={replacedToken}
                        removeReplacement={removeReplacement}
                        showRemovePopover={showRemovePopover}
                        setShowRemovePopover={setShowRemovePopover}
                        inputWidth={hasSuggestedMetaTag ? parseInt(inputWidth) - 12 : inputWidth}   // Note: 1em = 16px
                        bgColorMap={bgColorMap}
                        suggestedToken={suggestedToken}
                        showAddSuggestionPopover={showAddSuggestionPopover}
                        setShowAddSuggestionPopover={setShowAddSuggestionPopover}   
                        addSuggestedReplacement={addSuggestedReplacement}
                        removeSuggestedReplacement={removeSuggestedReplacement}         
                    />
                    {
                        hasSuggestedMetaTag ?
                        <div className={classes.tokenCircle}></div>
                        : null
                    }   
    
    
                </div>
    
                <ContextMenu
                    menu_id={MENU_ID}
                    tokenInfo={tokenInfo}
                    addMetaTag={addMetaTag}
                />
                </>
                : <p>...</p>

            }
        </div>
    )
}
