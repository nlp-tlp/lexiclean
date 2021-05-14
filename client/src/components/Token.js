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
    'stm': 'aqua',
    'ua': '#F2A477',
}

export default function Token({tokenInfo, textIndex, replacementDict, setReplacementDict, metaTagSuggestionMap, setMetaTagSuggestionMap, updateSingleToken, setUpdateSingleToken, selectMode, setSelectedTokens}) {
    const classes = useStyles();

    // Token
    const { index, value } = tokenInfo;
    const tokenId = tokenInfo.token;
    const tokenIndex = index;
    const [originalToken] = useState(value);
    const [replacedToken, setReplacedToken] = useState(tokenInfo.replacement);
    // If array is empty set to null.
    const [suggestedToken, setSuggestedToken] = useState((tokenInfo.suggested_replacement && tokenInfo.suggested_replacement.length) ? tokenInfo.suggested_replacement : null);  
    // Set current token as replacement if it's available, otherwise as suggestion if only one is made. If multiple are made then currentToken remains as the original value.
    const [currentToken, setCurrentToken] = useState(replacedToken ? replacedToken : (suggestedToken && suggestedToken.length === 1)  ? suggestedToken : value);
    
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


    // Segmentation handler
    const [selectTokenMode, setSelectTokenMode] = useState(false);

    const toggleAction = (event) => {
        console.log(event);
        if (event.ctrlKey){
          // In select mode - user can click on tokens to concatenate them.
          console.log('control down?', event.ctrlKey)
          setSelectTokenMode(true);
        //   setSelectedTokens(prevState => ({...prevState, [tokenIndex]: currentToken}))
    
        } else {
          // When select mode is off - popover will confirm selected tokens are correct before concatenation. 
          console.log('control down?', event.ctrlKey)
          setSelectTokenMode(false)
        }
      }


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
    
        } else if (suggestedToken && suggestedToken.length === 1){
            setTokenClf('st')
        } else if (suggestedToken && suggestedToken.length > 1){
            setTokenClf('stm'); // suggested token - multiple
        } else {
            setTokenClf('ua')
        }
        setBgColor(bgColorMap[tokenClf])

    }, [tokenClf, bgColorMap, replacedToken, suggestedToken, tokenInfo, hasSuggestedMetaTag, metaTagSuggestionMap])
    
    useEffect(() => {
        // Set input field width
        const minWidth = 60;
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

    const modifyToken = (targetValue) => {
        setShowPopover(true);
        setCurrentToken(targetValue);
        localStorage.setItem('id', tokenId) // this is used to help keep track of the current token being interacted with
    }

    const modifyReplacmentDict = () => {
        // Check if replacement exists for originalToken
        const replacementKeyExists = Object.keys(replacementDict).includes(originalToken);
        if (tokenId === localStorage.getItem('id')){
            console.log('updating replacement dictionary!!')
            if (!replacementKeyExists){
                // console.log('Adding first key to replacement dictionary')
                const firstReplacementArr = [currentToken];
                // Update replacement dictionary
                setReplacementDict(prevState => ({...prevState, [originalToken]: firstReplacementArr}));
    
            } else {
                console.log('additional keys', originalToken, currentToken, replacementDict, replacementDict[originalToken], replacementDict[originalToken].push(currentToken))
                // Update replacement dictionary
                // TODO: Understand why we don't need to push into the array... the token just magically appears
                const updatedReplacementsSet = new Set(replacementDict[originalToken])
                setReplacementDict(prevState => ({...prevState, [originalToken]: Array.from(updatedReplacementsSet)}));
            }

            setUpdateSingleToken(null);
        }
    }


    useEffect(() => {
        if (!edited && !updateSingleToken && updateSingleToken !== null){    // !u... is true whther false or null...
            // Making suggested replacements on tokens
            console.log(replacementDict);
            console.log(currentToken);
            
            if (Object.keys(replacementDict).includes(currentToken)){
                // If replacement map is one-one then update the current token, else don't update (user has to drill down to determine best choice)
                console.log('in replace dict side effect -', currentToken, replacementDict[currentToken])

                if(replacementDict[currentToken].length > 1){
                    // Multiple candidate replaceaments
                    // For multiple replacements - array is passed to child as they will be rendered as selections for the user.
                    console.log('multiple suggestions available')
                    setSuggestedToken(replacementDict[currentToken])

                } else {
                    // Only one replacement
                    // For single replacements, no array is passed to children.
                    console.log('only have one suggested replacement:', currentToken, ' to ', replacementDict[currentToken][0]);
                    setSuggestedToken(replacementDict[currentToken][0])
                    setCurrentToken(replacementDict[currentToken][0])
                }
            }
        }

    }, [updateSingleToken, replacementDict])


    const addReplacement = async (isSingle) => {
        // Adds a replacement based on user input into token input field
        const response = await axios.patch(`/api/token/replace/${tokenId}`, { replacement: currentToken });

        if (response.status === 200){
            console.log('replacement response', response);
            setSavedChange(true);
            setShowPopover(false);
            setUpdateSingleToken(isSingle);
            modifyReplacmentDict();

        }
    }






    const removeReplacement = async () => {
        const response = await axios.delete(`/api/token/replace-remove/${tokenId}`)
        if (response.status === 200){
            // Remove replacement from dictionary (used to update other tokens)
            if (replacementDict[originalToken]){
                // If page is refreshed - replacements will be lost so removing will error out. TODO: add replacement dict into local storage.
                setReplacementDict(prevState => ({...prevState, [originalToken]: prevState[originalToken].filter(token => token !== currentToken)}));
            }
            setCurrentToken(originalToken);
            setShowRemovePopover(false);
            setSavedChange(false);
            setReplacedToken(null);
            setEdited(false);
            console.log('Replacement was successfully removed.')
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

    const addSuggestedReplacement = async (suggestReplacementToken) => {
        // Converts a suggested token into an actual replacement

        const response = await axios.patch(`/api/token/suggestion-add/${tokenId}`, {suggested_replacement: suggestReplacementToken});
        if (response.status === 200){
            console.log('succesfully added suggested replacement.');
            setSuggestedToken(null);
            setReplacedToken(suggestReplacementToken);
            setCurrentToken(suggestReplacementToken);
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
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.5em'}} key={tokenIndex} id={`token-${tokenClf}`} onMouseDown={toggleAction}>
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
                    tokenClf={tokenClf}
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
                        setSuggestedToken={setSuggestedToken}
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
