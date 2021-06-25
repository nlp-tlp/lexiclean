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
                                setChangeTrigger,
                                setToastInfo,
                                activeMaps,
                                setSavePending
                            }) {
    const classes = useStyles();

    // console.log('token info -> ', tokenInfo); // using for tokenize dev... issues atm with resulting data structures...

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
        // Handles when tokens have bulk replacements added
        if (!edited && !replacedToken && Object.keys(replacementDict).includes(originalToken)){ //  && !suggestedToken &&
            console.log('Change occured - Updating tokens to reflect changes')
            setSuggestedToken(replacementDict[originalToken]);
            setCurrentToken(replacementDict[originalToken]);
        }
    }, [changeTrigger])

    const addReplacement = async (isSingle) => {
        const response = await axios.patch(`/api/token/replace/add/single/${tokenId}`, { replacement: currentToken });
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
        // Cancel of dictionary add action
        if (suggestedToken){
            setCurrentToken(suggestedToken);
        } else {
            setCurrentToken(originalToken);
        }
        setChangeTrigger(!changeTrigger);
    }

    const addSuggestedReplacement = async (isSingle) => {
        // 'accept all' for suggested replacements is a WIP as its challenging to trigger side effect
        const response = await axios.patch(`/api/token/suggest/add/single/${tokenId}`, { suggested_replacement: currentToken });
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
            const response = await axios.patch(`/api/token/meta/add/single/${tokenId}`, {field: field, value: value});
            if (response.status === 200){
                const metaTagUpdate = {...tokenInfo1.meta_tags, [field]: value}
                setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
                setToastInfo({type: "meta", content: {original: originalToken, metaTag: field, metaTagValue: value, count: 1}});
                setMetaTagUpdated(true);
            }
        } else {
            // meta-tag to cascaded across all tokens that have the same value
            const response = await axios.patch(`/api/token/meta/add/many/${projectId}`, { "originalToken": originalToken, "field": field, "value": value });
            if (response.status === 200){
                console.log('response for multiple token meta tag update', response.data)
                const metaTagUpdate = {...tokenInfo1.meta_tags, [field]: value}
                setTokenInfo1(prevState => ({...prevState, meta_tags: metaTagUpdate}))
                setToastInfo({type: "meta", content: {original: originalToken, metaTag: field, metaTagValue: value, count: response.data.matches}});
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
        const response = await axios.patch(`/api/token/meta/remove/one/${tokenId}`, { "field": field });
        if (response.status === 200){
            // console.log('succesfully removed meta-tag from token', response.data);
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
