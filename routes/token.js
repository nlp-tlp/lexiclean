const express = require('express');
const router = express.Router();
const logger = require('../logger');
const Token = require('../models/Token');
const Text = require('../models/Text');

// Add replacement on single token (sets text annotated state to true)
router.patch('/replace/add/single/', async (req, res) => {

    try{
        logger.info('Adding replacement to a single token', {route: '/api/token/replace/add/single/', body: req.body})
        const updatedReponse = await Token.updateOne(
                                                    { _id: req.body.token_id },
                                                    {
                                                        replacement: req.body.replacement,
                                                        last_modified: new Date(Date.now())
                                                    },
                                                    { upsert: true }
                                                    )
        await Text.updateOne({ _id: req.body.text_id}, {annotated: true, last_modified: new Date(Date.now())}, {upsert: true});

        res.json(updatedReponse);
    }catch(err){
        res.json({ message: err })
    }
})

// Remove replacement on one token
router.delete('/replace/remove/single/:tokenId', async (req, res) => {
    try {
        logger.info('Removing replacement on single token', {route: `/api/token/replace/remove/single/${req.params.tokenId}`})
        const response = await Token.updateOne({ _id: req.params.tokenId}, {replacement: null})
        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
})

// Convert suggested replacement to replacement on one token (also sets text annotated to true)
router.patch('/suggest/add/single/', async (req, res) => {
    try{
        logger.info('Converting single suggested token into replacement', {route: '/api/token/suggest/add/single/', body: req.body})
        const updatedReponse = await Token.updateOne(
                                                    { _id: req.body.token_id },
                                                    {
                                                        replacement: req.body.suggested_replacement,
                                                        suggested_replacement: null,
                                                        last_modified: new Date(Date.now())
                                                    },
                                                    { upsert: true }
                                                    )
        await Text.updateOne({ _id: req.body.text_id}, {annotated: true, last_modified: new Date(Date.now())}, {upsert: true});
        res.json(updatedReponse);
    }catch(err){
        res.json({ message: err })
    }
})


// Add suggested replacement for all tokens of same value (single OOV->IV map) (does not accept)
router.patch('/suggest/add/many/:projectId', async (req, res) => {
    try{
        logger.info('Adding suggestions to all project tokens', {route: `/api/token/suggest/add/many/${req.params.projectId}`})
        const originalToken = req.body.original_token;
        const replacement = req.body.replacement;

        // Get all tokens that match the original_tokens value
        const tokenResponse = await Token.find({ project_id: req.params.projectId, value: originalToken}).lean();
        
        // Filter out existing replacements
        const candidateTokens = tokenResponse.filter(token => token.replacement === null).map(token => token);
        console.log('number of matches', candidateTokens.length);

        const updateTokens = candidateTokens.map(token => ({
            updateOne: {
                filter: { _id: token._id },
                update: {
                    suggested_replacement: replacement
                },
                upsert: true
            }
        }))
        await Token.bulkWrite(updateTokens);
        res.json({"matches": candidateTokens.length})

    }catch(err){
        res.json({ message: err })
    }
})


// Remove suggested replacement on single token
router.delete('/suggest/remove/single/:tokenId', async (req, res) => {
    try {
        logger.info('Removing suggested replacement on single token', {route: `/api/token/suggest/remove/${req.params.tokenId}`})
        const response = await Token.updateOne({ _id: req.params.tokenId}, { suggested_replacement: null })
        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
})


// [review] Patch suggested_replacements over all tokens in a project
// router.patch('/suggest/all/:projectId', async (req, res) => {
//     try{
//         // logger.info('Updating suggested replacements based on a replacement dictionary for entire project', {route: `/api/token/suggest/remove/${req.params.tokenId}`})
//         const replacementDict = req.body.replacement_dict;
//         const replacementDictKeys = Object.keys(replacementDict); // original tokens, not replacements.
//         // console.log('using replacement dictionary ->', replacementDict)
//         // console.log('searching for keys ->', replacementDictKeys);
        
//         const textResponse = await Text.find({ project_id: req.params.projectId })
//                                        .populate('tokens.token');
        
//         // Do not override existing replacements so these are filter out
//         const candidateTokens = textResponse.map(text => text.tokens.filter(tokenInfo => tokenInfo.token.replacement == null).map(tokenInfo => tokenInfo)).flat();
//         // console.log(candidateTokens);
//         // console.log('number of candidate tokens (those without replacements) ->', candidateTokens.length)

//         const suggestReplaceTokens = candidateTokens.filter(tokenInfo => replacementDictKeys.includes(tokenInfo.token.value)).map(tokenInfo => ({"_id": tokenInfo.token._id, "value": tokenInfo.token.value}));
//         // console.log('number of matched candidates ->', suggestReplaceTokens)

//         // Patch suggested_replacement field with replacement
//         const suggestedReplaceResponse = await Token.bulkWrite(suggestReplaceTokens.map(token => ({
//             updateOne: {
//                 filter: {_id: token._id},
//                 update: {"suggested_replacement": replacementDict[token.value]},
//                 upsert: true
//             }
//         })))

//         res.json(suggestedReplaceResponse);

//     }catch(err){
//         res.json({ message: err })
//     }
// })


// [review] Patch replacement with suggested replacement for tokens in n texts
// router.patch('/suggest-confirm/', async (req, res) => {
//     //console.log('Converting suggested replacements to replacements on page');

//     const replacementDict = req.body.replacement_dict;
//     //console.log('replacement dictionary ->', replacementDict)
//     const replacementDictKeys = Object.keys(replacementDict); // original tokens, not replacements.
//     //console.log('replacement dictionary keys ->', replacementDictKeys);

//     const textIdsList = req.body.textIds;
//     //console.log('list of text ids ->', textIdsList);
    
//     try{
//         const textResponse = await Text.find({ _id: textIdsList})
//                                         .populate('tokens.token')
//                                         .lean();


//         // Do not override existing replacements so these are filter out
//         const candidateTokens = textResponse.map(text => text.tokens.filter(tokenInfo => tokenInfo.token.replacement == null).map(tokenInfo => tokenInfo)).flat();
//         // console.log(candidateTokens);
//         // console.log('candidate tokens for suggested replacement', candidateTokens.length)

//         const suggestReplaceTokens = candidateTokens.filter(tokenInfo => replacementDictKeys.includes(tokenInfo.token.value)).map(tokenInfo => ({"_id": tokenInfo.token._id, "value": tokenInfo.token.value}));
//         // console.log(suggestReplaceTokens)


//         // Patch suggested_replacement field with replacement
//         const suggestedReplaceResponse = await Token.bulkWrite(suggestReplaceTokens.map(token => ({
//             updateOne: {
//                 filter: { _id: token._id },
//                 update: {
//                     "replacement": replacementDict[token.value],
//                     "suggested_replacement": null
//                 },
//                 upsert: true
//             }
//         })))

//         // Patch text with annotated status

//         res.json(suggestedReplaceResponse)
//     }catch(err){
//         res.json({ message: err })
//     }
// })


// Accept suggested replacements as actual replacements for n texts
router.patch('/suggest/accept/:projectId', async (req, res) => {
    try{
        logger.info('Accepting suggested replacements on n texts', {route: `/api/token/suggest/accept/${req.params.projectId}`})
        const textIds = req.body.textIds;
        const textResponse = await Text.find({ _id: {$in: textIds}}).populate('tokens.token').lean();

        // Filter texts for token that have suggestions
        const candidateTokens = textResponse.map(text => text.tokens.filter(tokenInfo => tokenInfo.token.suggested_replacement).map(tokenInfo => tokenInfo.token)).flat();
        //console.log(candidateTokens);

        // Create objects that convert suggestion to replacement
        const suggestReplaceTokens = candidateTokens.map(token => ({"_id": token._id, "replacement": token.suggested_replacement }));
        //console.log(suggestReplaceTokens);

        // Update tokens
        const suggestedReplaceResponse = await Token.bulkWrite(suggestReplaceTokens.map(token => ({
            updateOne: {
                filter: { _id: token._id },
                update: {
                    "replacement": token.replacement,
                    "suggested_replacement": null
                },
                upsert: true
            }
        })))

        res.json(suggestedReplaceResponse)
    }catch(err){
        res.json({ message: err })
    }
})


// [requires TEST] Convert single suggested replacement type to replacement for all tokens matched
router.patch('/suggest/accept/single/:projectId', async (req, res) => {
    try{
        logger.info('Accepting single suggested replacement for all matched tokens', {route: `/api/token/suggest/accept/single/${req.params.projectId}`})
        const tokenValue = req.body.tokenValue;
        let tokenResponse = await Token.find({ project_id: req.params.projectId, value: tokenValue}).lean();
        // filter out tokens that have same original value but already have replacements
        tokenResponse = tokenResponse.filter(token => !token.replacement)
        // Update tokens
        const suggestedReplaceResponse = await Token.bulkWrite(tokenResponse.map(token => ({
            updateOne: {
                filter: { _id: token._id },
                update: {
                    "replacement": token.suggested_replacement,
                    "suggested_replacement": null
                },
                upsert: true
            }
        })))

        res.json(suggestedReplaceResponse)
    }catch(err){
        res.json({ message: err })
    }
})





// --- Meta Tags ---

// Patch meta-tag on one token
router.patch('/meta/add/single/', async (req, res) => {
    // Takes in field, value pair where the field is the axuiliary information key
    try{
        const tokenResponse = await Token.findById({ _id: req.body.token_id }).lean();
        const updatedMetaTags = {...tokenResponse.meta_tags, [req.body.field]: req.body.value};
        const updatedReponse = await Token.findByIdAndUpdate(
                                                        { _id: req.body.token_id },
                                                        {
                                                            meta_tags: updatedMetaTags,
                                                            last_modified: new Date(Date.now())
                                                        },
                                                        { upsert: true }
                                                        )
                                                    .lean();

        await Text.updateOne({ _id: req.body.text_id}, {annotated: true, last_modified: new Date(Date.now())}, {upsert: true});
                                        
        res.json(updatedReponse);
    }catch(err){
        res.json({ message: err })
    }
})


// Patch meta-tags on all tokens
router.patch('/meta/add/many/:projectId', async (req, res) => {
    // Takes in field, value pair where the field is the meta-tag information key
    // Updates all values in data set that match with meta-tag boolean
    //console.log('Patching meta-tags on all tokens')
    try{
        const originalTokenValue = req.body.original_token;
        const metaTag = req.body.field;
        const metaTagValue = req.body.value;

        // Get all tokens that match body token 
        const tokenResponse = await Token.find({ project_id: req.params.projectId, value: originalTokenValue }).lean();
        //console.log('number of tokens patched', tokenResponse.length);

        const updateTokens = tokenResponse.map(token => ({
            updateOne: {
                filter: { _id: token._id },
                update: {
                    meta_tags: {...token.meta_tags, [metaTag]: metaTagValue }
                },
                upsert: true
            }
        }))
        
        await Token.bulkWrite(updateTokens);
        
        // Update text annotation states

        


        
        res.json({'matches': tokenResponse.length})
    }catch(err){
        res.json({ message: err })
    }
})

// Removes meta-tag from one token
router.patch('/meta/remove/one/:tokenId', async (req, res) => {
    //console.log('removing meta-tag from single token')
    try{
        const tokenResponse = await Token.findById({ _id: req.params.tokenId }).lean();
        const updatedMetaTags = {...tokenResponse.meta_tags, [req.body.field]: false};
        const response = await Token.findByIdAndUpdate(
                                                { _id: req.params.tokenId}, 
                                                { 
                                                    meta_tags: updatedMetaTags,
                                                    last_modified: new Date(Date.now())
                                                },
                                                { upsert: true }
                                                ).lean()
        res.json(response)
    }catch(err){
        res.json({ message: err })
    }
})


module.exports = router;