import React, { useState, useEffect } from 'react'
import { useContextMenu } from "react-contexify";
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';
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

const bgColorMap = {
    'ds': 'red',
    'ab': 'purple',
    'ew': '#D9D9D9',
    'no': 'blue',
    'un': 'brown', 
    'rm': 'yellow',
    'rt': '#99BF9C',
    'st': '#6BB0BF',
    'sn': 'pink',
    'ua': '#F2A477',
}

export default function Token({tokenInfo, textIndex, replacementDict, setReplacementDict, metaTagSuggestionMap, setMetaTagSuggestionMap, updateSingleToken, setUpdateSingleToken, selectedTokens, setSelectedTokens, bgColourMap}) {
    const classes = useStyles();

    const { projectId } = useParams();
    
    // Token
    const [tokenInfo1, setTokenInfo1] = useState(tokenInfo);
    const { index, value } = tokenInfo1;
    const tokenId = tokenInfo1.token;
    const tokenIndex = index;
    const [originalToken] = useState(value);
    const [replacedToken, setReplacedToken] = useState(tokenInfo1.replacement);
    const [suggestedToken, setSuggestedToken] = useState(tokenInfo1.suggested_replacement ? tokenInfo1.suggested_replacement : null );  
    // Set current token as replacement or suggested_token if available
    const [currentToken, setCurrentToken] = useState(replacedToken ? replacedToken : tokenInfo1.suggested_replacement ? tokenInfo1.suggested_replacement : value);
    
    // Token classification and colouring
    const [tokenClf, setTokenClf] = useState();
    const [bgColor, setBgColor] = useState()
    
    // Meta Tag
    const [metaTagUpdated, setMetaTagUpdated] = useState(false);    // Used for bg color sideeffect when removing/adding meta-tags

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


    // Segmentation handler - used to join ill-formed ngrams
    const [selectTokenMode, setSelectTokenMode] = useState(false);

    const toggleAction = (event) => {
        // actions for tokenization and concatenation of texts



        if (event.shiftKey){
            // User wants to tokenize token on white space
            console.log('shift click - Tokenization action');

        } else if (event.ctrlKey){
          // In select mode - user can click on tokens to concatenate them.
          console.log('control click - segmentation handler')
          setSelectTokenMode(true);
          setSelectedTokens(prevState => ({...prevState, [tokenIndex]: tokenId}))
        }
        else {
          // When select mode is off - popover will confirm selected tokens are correct before concatenation. 
          console.log('click without key down - clean up')
          if(selectedTokens && Object.keys(selectedTokens).length > 1){
              console.log('Do you want to segment these tokens?')
          }
          setSelectTokenMode(false)
          setSelectedTokens({})
        }
      }






      useEffect(() => {
        // console.log('current rd', replacementDict);
      }, [replacementDict])


    useEffect(() => {
        // Updates token colour based on state of token information and subsequent classification
        console.log('tokeninfo1', tokenInfo1)
        const bgColour = Object.keys(tokenInfo1.meta_tags).filter(tag => tokenInfo1.meta_tags[tag])
        if (bgColour.length > 0){
            // Has at least one meta tag (first tag currently dictates colour - TODO: fix with preferential treatment)
            setTokenClf(bgColour[0])
            setBgColor(bgColourMap[bgColour[0]])
        } else {
            setTokenClf('ua');
            setBgColor(bgColourMap['ua'])
        }
    }, [tokenClf, metaTagUpdated, replacedToken, suggestedToken, tokenInfo1, metaTagSuggestionMap])
    

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
        if( originalToken !== currentToken && suggestedToken !== currentToken ){
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

            if (updateSingleToken){
                console.log('do something with single token - these are valuable')
            } else if (!replacementKeyExists){
                console.log('Updating replacement dictionary!!')
                // Update replacement dictionary
                setReplacementDict(prevState => ({...prevState, [originalToken]: currentToken}));
            } 
            setUpdateSingleToken(null);
        }
    }


    useEffect(() => {
        if (!edited && !updateSingleToken && updateSingleToken !== null){    // !u... is true whther false or null...
            // Making suggested replacements on tokens
            
            if (Object.keys(replacementDict).includes(currentToken)){
                // If replacement map is one-one then update the current token, else don't update (user has to drill down to determine best choice)
                // console.log('in replace dict side effect -', currentToken, replacementDict[currentToken])
                // Only one replacement
                // For single replacements, no array is passed to children.
                // console.log('only have one suggested replacement:', currentToken, ' to ', replacementDict[currentToken]);
                setSuggestedToken(replacementDict[currentToken])
                setCurrentToken(replacementDict[currentToken])
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
            if (isSingle){
                // Do not update the replacement dictionary if user only wants to replace single token
                // TODO: review - currently just storing in LS for fun
                // WIll get post processed to join similar original tokens that have multiple mappings
                // NOTE: cannot get the array to push correctly - keeps turning into a mysterious int
                // if (localStorage.getItem('singularReplacements')){
                //     const singularReplacements = JSON.parse(localStorage.getItem('singularReplacements'))
                //     console.log('singular replacements ls array - ', singularReplacements)
                //     localStorage.setItem('singularReplacements', JSON.stringify(singularReplacements.push({[originalToken]: currentToken})));
                // } else {
                //     localStorage.setItem('singularReplacements', JSON.stringify([{[originalToken]: currentToken}]))
                // }
            } else {
                setUpdateSingleToken(isSingle);
                modifyReplacmentDict();
            }
        }
    }

    const removeReplacement = async () => {
        const response = await axios.delete(`/api/token/replace-remove/${tokenId}`)
        if (response.status === 200){
            // Remove replacement from dictionary (used to update other tokens)
            if (replacementDict[originalToken]){
                // If page is refreshed - replacements will be lost so removing will error out. 
                // TODO: add replacement dictionary artifact into local storage
                console.log('remove rd', replacementDict);
                console.log('updated', Object.keys(replacementDict).filter(key => key !== originalToken).reduce((obj, key) => {obj[key] = replacementDict[key]; return obj;}, {}))
                setReplacementDict(Object.keys(replacementDict).filter(key => key !== originalToken).reduce((obj, key) => {obj[key] = replacementDict[key]; return obj;}, {}));
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

    const addSuggestedReplacement = async () => {
        // Converts a suggested token into an actual replacement

        const response = await axios.patch(`/api/token/suggestion-add/${tokenId}`, {suggested_replacement: currentToken});
        if (response.status === 200){
            console.log('succesfully added suggested replacement.');
            setSuggestedToken(null);
            setReplacedToken(currentToken);
            setCurrentToken(currentToken);
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


    // --- Meta Tag Logic ---
    useEffect(() => {
        // Updates token meta-tags when suggestion map changes
        console.log('side effect for metatag suggestion map')
        console.log(metaTagSuggestionMap)

        // Run tokens over meta tag suggestion map
        Object.keys(metaTagSuggestionMap)
                .filter(metaTag => Object.keys(metaTagSuggestionMap[metaTag]).length > 0)
                .map(metaTag => Object.keys(metaTagSuggestionMap[metaTag]).includes(currentToken) ? setTokenInfo1(prevState => ({...prevState, [metaTag]: metaTagSuggestionMap[metaTag]})) : null)

    }, [metaTagSuggestionMap])

    const addMetaTag = async (field, value, isSingle) => {
        setMetaTagUpdated(false);
        
        if (isSingle){
            // meta-tag only applied to single token
            const response = await axios.patch(`/api/token/add-one-meta-tag/${tokenId}`, {field: field, value: value});
            if (response.status === 200){
                console.log('response for single token meta tag update')
                const metaTagUpdate = {...tokenInfo1.meta_tag, [field]: value}
                setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
            }
            setMetaTagUpdated(true)
            
        } else {
            // meta-tag to cascaded across all tokens that have the same value
            // TODO: cascade meta-tags across data set when pagianting

            const response = await axios.patch(`/api/token/add-many-meta-tag/${projectId}`, { "token": currentToken, "field": field, "value": value });
            if (response.status === 200){
                console.log('response for multiple token meta tag update')
                const metaTagUpdate = {...tokenInfo1.meta_tag, [field]: value}
                setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
            }

            // Add meta tag to suggestion map
            const subMetaTagMapUpdated = {...metaTagSuggestionMap[field], [currentToken]: value}
            console.log('sub meta map updated', subMetaTagMapUpdated)
            setMetaTagSuggestionMap(prevState => ({...prevState, [field]: subMetaTagMapUpdated}))
            setMetaTagUpdated(true)
        }
    }

    const removeMetaTag = async (field) => {
        // Removes meta-tag from token (set to false)
        setMetaTagUpdated(false);
        const response = await axios.patch(`/api/token/remove-one-meta-tag/${tokenId}`, { field: field });
        if (response.status === 200){
            console.log('succesfully removed meta-tag from token', response.data);
            setTokenInfo1(prevState => ({...prevState, [field]: false}))
            // setMetaTagSuggestionMap(Object.keys(metaTagSuggestionMap).filter())
            setMetaTagUpdated(true);
        }
    }


    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.5em'}} key={tokenIndex} id={`token-${tokenClf}`}
            // onMouseDown={toggleAction}
        >
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
                    replacedToken={replacedToken}
                />
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: (!suggestedToken) ? 'space-between' : null, width: inputWidth}}>
                    <TokenUnderline
                        savedChange={savedChange}
                        originalToken={originalToken}
                        currentToken={currentToken}
                        edited={edited}
                        replacedToken={replacedToken}
                        removeReplacement={removeReplacement}
                        showRemovePopover={showRemovePopover}
                        setShowRemovePopover={setShowRemovePopover}
                        inputWidth={inputWidth}   // Note: 1em = 16px
                        bgColorMap={bgColorMap}
                        suggestedToken={suggestedToken}
                        showAddSuggestionPopover={showAddSuggestionPopover}
                        setShowAddSuggestionPopover={setShowAddSuggestionPopover}
                        addSuggestedReplacement={addSuggestedReplacement}
                        removeSuggestedReplacement={removeSuggestedReplacement}
                        setSuggestedToken={setSuggestedToken}
                    />
                </div>
    
                <ContextMenu
                    menu_id={MENU_ID}
                    bgColourMap={bgColourMap}
                    tokenInfo={tokenInfo1}
                    addMetaTag={addMetaTag}
                    removeMetaTag={removeMetaTag}
                />
                </>
                : <p>...</p>

            }
        </div>
    )
}
