const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const Text = require('../models/Text');
const mongoose = require('mongoose');
const { text } = require('express');

// NEED INSERT MANY SO WE CAN SLAP X DOCS INTO DATA COLLECTION
router.post('/upload', async (req, res) => {
    console.log('Uploading tokens')
    
    // tokens is an array of objects
    const tokens = req.body.tokens;
    console.log(tokens);

    // Will need to load the map and use it to markup fields on the tokens (this will be done in another route)

    try{
        const response = await Token.insertMany(tokens)
        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
})

// Patch replacement on one token
router.patch('/replace/:tokenId', async (req, res) => {
    try{
        const updatedReponse = await Token.updateOne({ _id: req.params.tokenId},
                                                        { replacement: req.body.replacement, last_modified: Date.now()},
                                                        { upsert: true })
        
        res.json(updatedReponse);
    }catch(err){
        res.json({ message: err })
    }
})

// Convert suggested replacement to replacement on one token
router.patch('/suggestion-add/:tokenId', async (req, res) => {
    try{
        const updatedReponse = await Token.updateOne(
                                                {
                                                    _id: req.params.tokenId
                                                },
                                                {
                                                    replacement: req.body.suggested_replacement,
                                                    suggested_replacement: null,
                                                    last_modified: Date.now()},
                                                {
                                                    upsert: true
                                                }
                                                )
        res.json(updatedReponse);
    }catch(err){
        res.json({ message: err })
    }
})

// Remove replacement on one token
router.delete('/replace-remove/:tokenId', async (req, res) => {
    console.log('removing replacement on token');

    try {
        const response = await Token.updateOne({ _id: req.params.tokenId}, {replacement: null})

        res.json(response);

    }catch(err){
        res.json({ message: err })
    }
})

// Remove suggested replacement on one token
router.delete('/suggestion-remove/:tokenId', async (req, res) => {
    console.log('removing suggested replacement on token');
    try {
        const response = await Token.updateOne({ _id: req.params.tokenId}, {suggested_replacement: null})
        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
})

// Patch auxiliary on one token
router.patch('/auxiliary/:tokenId', async (req, res) => {
    // Takes in field, value pair where the field is the axuiliary information key
    console.log('Patching axuiliary information')
    // console.log(req.body);
    try{
        const updatedReponse = await Token.updateOne(
                                                {
                                                    _id: req.params.tokenId
                                                },
                                                {
                                                    [req.body.field]: req.body.value,
                                                    last_modified: Date.now()},
                                                {
                                                    upsert: true
                                                }
                                                )
        res.json(updatedReponse);
    }catch(err){
        res.json({ message: err })
    }
})

// Patch suggested_replacements over all tokens in a project
router.patch('/suggest-many/:projectId', async (req, res) => {
    console.log('Updating suggested_replacements based on a replacement dictionary for entire project');
    try{
        const replacementDict = req.body.replacement_dict;
        console.log(replacementDict)
        const replacementDictKeys = Object.keys(replacementDict); // original tokens, not replacements.
        console.log(replacementDictKeys);
        
        const textResponse = await Text.find({ project_id: req.params.projectId })
                                       .populate('tokens.token');
        
        // Do not override existing replacements so these are filter out
        const candidateTokens = textResponse.map(text => text.tokens.filter(tokenInfo => tokenInfo.token.replacement == null).map(tokenInfo => tokenInfo)).flat();
        console.log(candidateTokens);
        console.log('candidate tokens for suggested replacement', candidateTokens.length)

        const suggestReplaceTokens = candidateTokens.filter(tokenInfo => replacementDictKeys.includes(tokenInfo.token.value)).map(tokenInfo => ({"_id": tokenInfo.token._id, "value": tokenInfo.token.value}));
        console.log(suggestReplaceTokens)


        // Patch suggested_replacement field with replacement
        const suggestedReplaceResponse = await Token.bulkWrite(suggestReplaceTokens.map(token => ({
            updateOne: {
                filter: {_id: token._id},
                update: {"suggested_replacement": replacementDict[token.value]},
                upsert: true
            }
        })))

        res.json(suggestedReplaceResponse);

    }catch(err){
        res.json({ message: err })
    }
})

// Patch replacement with suggested replacement for tokens in n texts
router.patch('/suggest-confirm/', async (req, res) => {
    console.log('Converting suggested replacements to replacements on page');

    const replacementDict = req.body.replacement_dict;
    console.log(replacementDict)
    const replacementDictKeys = Object.keys(replacementDict); // original tokens, not replacements.
    console.log(replacementDictKeys);

    const textIdsList = req.body.textIds;
    console.log(textIdsList);
    
    try{
        const textResponse = await Text.find({ _id: textIdsList})
                                        .populate('tokens.token')
                                        .lean();


        // Do not override existing replacements so these are filter out
        const candidateTokens = textResponse.map(text => text.tokens.filter(tokenInfo => tokenInfo.token.replacement == null).map(tokenInfo => tokenInfo)).flat();
        console.log(candidateTokens);
        console.log('candidate tokens for suggested replacement', candidateTokens.length)

        const suggestReplaceTokens = candidateTokens.filter(tokenInfo => replacementDictKeys.includes(tokenInfo.token.value)).map(tokenInfo => ({"_id": tokenInfo.token._id, "value": tokenInfo.token.value}));
        console.log(suggestReplaceTokens)


        // Patch suggested_replacement field with replacement
        const suggestedReplaceResponse = await Token.bulkWrite(suggestReplaceTokens.map(token => ({
            updateOne: {
                filter: {_id: token._id},
                update: {
                    "replacement": replacementDict[token.value],
                    "suggested_replacement": null},
                upsert: true
            }
        })))

        res.json(suggestedReplaceResponse)
    }catch(err){
        res.json({ message: err })
    }
})




// Get one token
// router.get('/one/:tokenId', async (req, res) => {
//     try{
//         const response = await Data.find({"tokens._id": req.params.tokenId})
//         console.log(response);
//         const tokenInfo = response[0].tokens.filter(token => token._id == req.params.tokenId)[0];
//         console.log(tokenInfo);
//         res.json(tokenInfo)
//     }catch(err){
//         res.json({ message: err })
//     }
// })


// **********************************************************************



module.exports = router;