import React, { useState, useEffect } from 'react'
import { useContextMenu } from "react-contexify";
import { useParams } from 'react-router-dom';
import axios from 'axios';

import ContextMenu from './utils/ContextMenu';
import TokenInput from './TokenInput';
import TokenUnderline from './TokenUnderline';

export default function Token({tokenInfo,
                                textId,
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
                                setChangeTrigger,
                                setToastInfo,
                                activeMaps,
                                setSavePending,
                                schemaTrigger
                            }) {
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
    const MENU_ID = `menu-${textId}-${tokenIndex}`;
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
        // console.log(bgColourMap)
        const bgColourKey = Object.keys(tokenInfo1.meta_tags).filter(tag => tokenInfo1.meta_tags[tag])
        const tokenBgColourKeySet = new Set(bgColourKey);
        const bgColourMapKeySet = new Set(Object.keys(bgColourMap));
        const keyIntersect = new Set([...bgColourMapKeySet].filter(x => tokenBgColourKeySet.has(x)))
        if (keyIntersect.size > 0){
            // Has at least one meta tag (first tag currently dictates colour - TODO: fix with preferential treatment)
            
            // Get token clf from first value from set intersection
            const clf = keyIntersect.values().next().value
            setTokenClf(clf)
            setBgColour(bgColourMap[clf])
        } else {
            setTokenClf('ua');
            setBgColour(bgColourMap['ua'])
        }
    }, [tokenClf, metaTagUpdated, replacedToken, suggestedToken, tokenInfo1, metaTagSuggestionMap, schemaTrigger])
    
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
        // Handles when tokens have bulk replacements added
        if (!edited && !replacedToken && Object.keys(replacementDict).includes(originalToken)){ //  && !suggestedToken &&
            setSuggestedToken(replacementDict[originalToken]);
            setCurrentToken(replacementDict[originalToken]);
        }
    }, [changeTrigger])

    const addReplacement = async (isSingle) => {
        console.log(textId);
        const response = await axios.patch('/api/token/replace/add/single/', { token_id: tokenId, text_id: textId, replacement: currentToken });
        // setShowPopover(false); // use here if the front end wants to appear to be quick rather than waiting for slow responses when rendering large pages
        if (isSingle && response.status === 200){
            setChangeTrigger(!changeTrigger);
            setShowPopover(false);
        } else if(!isSingle && response.status === 200) {
            const response = await axios.patch(`/api/token/suggest/add/many/${projectId}`, { original_token: originalToken, replacement: currentToken });
            if (response.status === 200){
                console.log('replace response -> ', response.data);
                if (tokenId === localStorage.getItem('id')){
                    setReplacementDict(prevState => ({...prevState, [originalToken]: currentToken}))
                }
                setToastInfo({type: "replacement", content: {original: originalToken, replacement: currentToken, count: response.data.matches + 1}});
                setChangeTrigger(!changeTrigger);
                setShowPopover(false);
                setSavePending(true);
            }
        }
    }

    const removeReplacement = async () => {
        const response = await axios.delete(`/api/token/replace/remove/single/${tokenId}`)
        if (response.status === 200){
            setCurrentToken(originalToken);
            setReplacedToken(null);
            setEdited(false);
            setShowRemovePopover(false);
            setChangeTrigger(!changeTrigger);
        }
    }

    const cancelChange = () => {
        if (suggestedToken){
            setCurrentToken(suggestedToken);
        } else {
            setCurrentToken(originalToken);
        }
        setChangeTrigger(!changeTrigger);
    }

    const addSuggestedReplacement = async (isSingle) => {
        // 'accept all' for suggested replacements is a WIP as its challenging to trigger side effect
        const response = await axios.patch('/api/token/suggest/add/single/', { token_id: tokenId, text_id: textId, suggested_replacement: currentToken });
        if (response.status === 200){ // isSingle && 
            console.log('succesfully added one suggested replacement');
            setSuggestedToken(null);
            setReplacedToken(currentToken);
            setCurrentToken(currentToken);
            setShowAddSuggestionPopover(false)
        }
        // else if(!isSingle && response.status === 200){
        //     console.log('updating many tokens with suggestion');
        //     const response = await axios.patch(`/api/token/suggest/accept/single/${projectId}`, { tokenValue: originalToken });
        //     if (response.status === 200){
        //         console.log('succesfully updated suggested tokens...')
        //         // setSuggestedToken(null);
        //         setReplacedToken(currentToken);
        //         setCurrentToken(currentToken);
        //         setShowAddSuggestionPopover(false);
        //         setChangeTrigger(!changeTrigger);
        //     }

        // }
    }

    const removeSuggestedReplacement = async () => {
        const response = await axios.delete(`/api/token/suggest/remove/single/${tokenId}`);
        if (response.status === 200){
            console.log('succesfully removed suggested replacement.');
            setShowAddSuggestionPopover(false)
            setSuggestedToken(null);
            setCurrentToken(originalToken);
        }
    }


    // --- Meta Tag ---
    useEffect(() => {
        // Updates token meta-tags when suggestion map changes
        // Run tokens over meta tag suggestion map
        Object.keys(metaTagSuggestionMap)   // access meta tag keys (en, rp, etc.)
                .filter(metaTag => Object.keys(metaTagSuggestionMap[metaTag]).length > 0) // Check whether key has any values e.g. 'ds': {rods: true, steels: true} etc.
                .map(metaTag => {
                    // Check whether current token is in suggestions
                    if (Object.keys(metaTagSuggestionMap[metaTag]).includes(currentToken)){
                        // Update metatag for matched token (need to access the objects value)
                        const metaTagUpdate = {...tokenInfo1.meta_tags, [metaTag]: Object.values(metaTagSuggestionMap[metaTag])[0]}
                        setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
                    }
                });

    }, [metaTagSuggestionMap])


    const addMetaTag = async (field, value, isSingle) => {
        setMetaTagUpdated(false);
        
        if (isSingle){
            const response = await axios.patch('/api/token/meta/add/single/', {token_id: tokenId, text_id: textId, field: field, value: value});
            if (response.status === 200){
                const metaTagUpdate = {...tokenInfo1.meta_tags, [field]: value}
                setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
                setToastInfo({type: "meta", content: {original: originalToken, metaTag: field, metaTagValue: value, count: 1}});
                setMetaTagUpdated(true);
            }
        } else {
            // meta-tag to cascaded across all tokens that have the same value
            const response = await axios.patch(`/api/token/meta/add/many/${projectId}`, { original_token: originalToken, field: field, value: value });
            if (response.status === 200){
                const metaTagUpdate = {...tokenInfo1.meta_tags, [field]: value}
                setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
                setToastInfo({type: "meta", content: {original: originalToken, metaTag: field, metaTagValue: value, count: response.data.matches}});
            }

            // Add meta tag to suggestion map
            const subMetaTagMapUpdated = {...metaTagSuggestionMap[field], [currentToken]: value}
            setMetaTagSuggestionMap(prevState => ({...prevState, [field]: subMetaTagMapUpdated}))
            setMetaTagUpdated(true)
        }
    }

    const removeMetaTag = async (field) => {
        setMetaTagUpdated(false);
        const response = await axios.patch(`/api/token/meta/remove/one/${tokenId}`, { "field": field });
        if (response.status === 200){
            const metaTagUpdate = {...tokenInfo1.meta_tag, [field]: false}
            setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
            setMetaTagUpdated(true);
        }
    }


    const tokenInputProps = {
        showContextMenu,
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
    }

    const TokenUnderlineProps = {
        changeTrigger,
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
        removeSuggestedReplacement,
        setSuggestedToken
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
                    {...tokenInputProps}
                />
                <div
                    style={{display: 'flex', flexDirection: 'row', justifyContent: !suggestedToken ? 'space-between' : null, width: inputWidth}}
                >
                    <TokenUnderline
                        {...TokenUnderlineProps}
                    />
                </div>
    
                <ContextMenu
                    menu_id={MENU_ID}
                    bgColourMap={bgColourMap}
                    tokenInfo={tokenInfo1}
                    addMetaTag={addMetaTag}
                    removeMetaTag={removeMetaTag}
                    activeMaps={activeMaps}
                />
                </>
                : <p>...</p>

            }
        </div>
    )
}
