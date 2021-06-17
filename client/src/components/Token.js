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

export default function Token({tokenInfo,
                                textIndex,
                                replacementDict,
                                setReplacementDict,
                                metaTagSuggestionMap,
                                setMetaTagSuggestionMap,
                                updateSingleToken,
                                setUpdateSingleToken,
                                selectedTokens,
                                setSelectedTokens,
                                bgColourMap,
                                tokenize,
                                changeTrigger,
                                setChangeTrigger
                            }) {
    const classes = useStyles();

    // console.log(tokenInfo);

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
    const [bgColour, setBgColour] = useState()
    
    // Meta Tag
    const [metaTagUpdated, setMetaTagUpdated] = useState(false);    // Used for bg color sideeffect when removing/adding meta-tags

    // Menu
    const MENU_ID = `menu-${textIndex}-${tokenIndex}`;
    const { show: showContextMenu } = useContextMenu({ id: MENU_ID });
    
    // User interaction
    const [edited, setEdited] = useState(false);
    const [inputWidth, setInputWidth] = useState(`${(currentToken.length + 2) * 8}px`)  // dynamically changes input width based on text value
    
    // Popover Controllers
    const [showPopover, setShowPopover] = useState(false);
    const [showRemovePopover, setShowRemovePopover] = useState(false);
    const [showAddSuggestionPopover, setShowAddSuggestionPopover] = useState(false);

    useEffect(() => {
        // Updates token colour based on state of token information and subsequent classification
        // console.log('tokeninfo1', tokenInfo1)
        // console.log('updating colour!')
        const bgColourKey = Object.keys(tokenInfo1.meta_tags).filter(tag => tokenInfo1.meta_tags[tag])
        // console.log(tokenInfo1.value, bgColourKey)
        if (bgColourKey.length > 0){
            // Has at least one meta tag (first tag currently dictates colour - TODO: fix with preferential treatment)
            // console.log(tokenInfo1)
            setTokenClf(bgColourKey[0])
            setBgColour(bgColourMap[bgColourKey[0]])
        } else {
            setTokenClf('ua');
            setBgColour(bgColourMap['ua'])
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

    useEffect(() => {
        if (!edited && !replacedToken && !suggestedToken && Object.keys(replacementDict).includes(currentToken)){
            console.log('Change occured - Updating tokens to reflect changes')
            setSuggestedToken(replacementDict[currentToken]);
            setCurrentToken(replacementDict[currentToken]);
        }
    }, [changeTrigger])

    const addReplacement = async (isSingle) => {
        const response = await axios.patch(`/api/token/replace/${tokenId}`, { replacement: currentToken });
        // console.log('Succesfully updated single token with replacement');
        if (isSingle && response.status === 200){
            setChangeTrigger(!changeTrigger);
            setShowPopover(false);
        } else if(!isSingle && response.status === 200) {
            const response = await axios.patch(`/api/token/suggest-many/${projectId}`, { replacement_dict: {[originalToken]: currentToken} });
            if (response.status === 200){
                if (tokenId === localStorage.getItem('id')){
                    // console.log('adding term to replacements');
                    setReplacementDict(prevState => ({...prevState, [originalToken]: currentToken}))
                }
                setChangeTrigger(!changeTrigger);
                setShowPopover(false);
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
            setChangeTrigger(!changeTrigger);
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
        setChangeTrigger(!changeTrigger);
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
        // console.log('side effect for metatag suggestion map')
        // console.log(metaTagSuggestionMap)

        // Run tokens over meta tag suggestion map
        Object.keys(metaTagSuggestionMap)   // access meta tag keys (en, rp, etc.)
                .filter(metaTag => Object.keys(metaTagSuggestionMap[metaTag]).length > 0) // Check whether key has any values e.g. 'ds': {rods: true, steels: true} etc.
                .map(metaTag => {
                    // Check whether current token is in suggestions
                    if (Object.keys(metaTagSuggestionMap[metaTag]).includes(currentToken)){
                        // console.log('token', currentToken,'matched to', metaTag)
                        console.log('checking metatags')

                        // Update metatag for matched token (need to access the objects value)
                        const metaTagUpdate = {...tokenInfo1.meta_tags, [metaTag]: Object.values(metaTagSuggestionMap[metaTag])[0]}
                        setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
                    }
                });

    }, [metaTagSuggestionMap])

    const addMetaTag = async (field, value, isSingle) => {
        setMetaTagUpdated(false);
        
        if (isSingle){
            // meta-tag only applied to single token
            const response = await axios.patch(`/api/token/add-one-meta-tag/${tokenId}`, {field: field, value: value});
            if (response.status === 200){
                // console.log('response for single token meta tag update')
                const metaTagUpdate = {...tokenInfo1.meta_tags, [field]: value}
                setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
            }
            setMetaTagUpdated(true)
            
        } else {
            // meta-tag to cascaded across all tokens that have the same value
            // TODO: cascade meta-tags across data set when pagianting

            const response = await axios.patch(`/api/token/add-many-meta-tag/${projectId}`, { "token": currentToken, "field": field, "value": value });
            if (response.status === 200){
                // console.log('response for multiple token meta tag update')
                const metaTagUpdate = {...tokenInfo1.meta_tags, [field]: value}
                setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
            }

            // Add meta tag to suggestion map
            const subMetaTagMapUpdated = {...metaTagSuggestionMap[field], [currentToken]: value}
            // console.log('sub meta map updated', subMetaTagMapUpdated)
            setMetaTagSuggestionMap(prevState => ({...prevState, [field]: subMetaTagMapUpdated}))
            setMetaTagUpdated(true)
        }
    }

    const removeMetaTag = async (field) => {
        // Removes meta-tag from token (set to false)
        setMetaTagUpdated(false);
        const response = await axios.patch(`/api/token/remove-one-meta-tag/${tokenId}`, { "field": field });
        if (response.status === 200){
            // console.log('succesfully removed meta-tag from token', response.data);
            const metaTagUpdate = {...tokenInfo1.meta_tag, [field]: false}
            setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
            setMetaTagUpdated(true);
        }
    }


    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.5em'}}
            key={tokenIndex}
            id={`token-${tokenClf}`}
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
                    bgColour={bgColour}
                    inputWidth={inputWidth}
                    addReplacement={addReplacement}
                    cancelChange={cancelChange}
                    originalToken={originalToken}
                    currentToken={currentToken}
                    bgColourMap={bgColourMap}
                    tokenClf={tokenClf}
                    replacedToken={replacedToken}
                />
                <div
                    style={{display: 'flex', flexDirection: 'row', justifyContent: (!suggestedToken) ? 'space-between' : null, width: inputWidth}}
                >
                    <TokenUnderline
                        changeTrigger={changeTrigger}
                        originalToken={originalToken}
                        currentToken={currentToken}
                        edited={edited}
                        replacedToken={replacedToken}
                        removeReplacement={removeReplacement}
                        showRemovePopover={showRemovePopover}
                        setShowRemovePopover={setShowRemovePopover}
                        inputWidth={inputWidth}   // Note: 1em = 16px
                        bgColourMap={bgColourMap}
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
