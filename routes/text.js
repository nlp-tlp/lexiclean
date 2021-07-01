const express = require('express');
const router = express.Router();
const logger = require('../logger');
const mongoose = require('mongoose');
const Text = require('../models/Text');
const Token = require('../models/Token');
const Map = require('../models/Map');


// Get single text
router.get('/:textId', async (req, res) => {
    try{
        logger.info('Get single text', {route: `/api/text/${req.params.textId}`})
        const response = await Text.findOne({ _id: req.params.textId})
                                    .populate('tokens.token');
        res.json(response);
    }catch(err){
        res.json({ message: err })
        logger.error('Failed to get single text', {route: `/api/text/${req.params.textId}`})
    }
})

// get all texts
router.get('/', async (req, res) => {
    try{
        const response = await Text.find()
                                    .populate('tokens.token');
        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
})


// Get number of total pages for paginator
router.get('/filter/pages/:projectId', async (req, res) => {
    try{
        logger.info('Getting number of pages for paginator', {route: `/api/text/filter/pages/${req.params.projectId}`});
        const textsCount = await Text.find({ project_id : req.params.projectId}).count();
        const pages = Math.ceil(textsCount/req.query.limit);
        res.json({"totalPages": pages})
    }catch(err){
        res.json({ message: err })
        logger.error('Failed to get number of pages for paginator', {route: `/api/text/filter/pages/${req.params.projectId}`});
    }
})


// PAGINATE DATA FILTERED BY PROJECT ID
// If any issues arise with results - refer to: https://github.com/aravindnc/mongoose-aggregate-paginate-v2/issues/18
router.get('/filter/:projectId', async (req, res) => {
    //console.log('Paginating through texts');
    try {
        const skip = parseInt((req.query.page - 1) * req.query.limit)
        const limit = parseInt(req.query.limit)
        // Paginate Aggregation
        const textAggregation = await Text.aggregate([
            {
                $match: { 
                    project_id: mongoose.Types.ObjectId(req.params.projectId), 
                }
            },
            {
                $lookup: {
                    from: 'tokens', // need to use MongoDB collection name - NOT mongoose model name
                    localField: 'tokens.token',
                    foreignField: '_id',
                    as: 'tokens_detail'
                }
            },
            {
                $project: {
                    annotated: "$annotated",
                    // weight: "$weight",
                    rank: "$rank",
                    tokens: {
                        $map : {
                            input: { $zip: { inputs: [ "$tokens", "$tokens_detail"]}},
                            as: "el",
                            in: {
                                $mergeObjects: [{"$arrayElemAt": [ "$$el", 0 ]}, {"$arrayElemAt": [ "$$el", 1 ] }]
                            }
                        }
                    }
                }
            },
            {
                $sort: { 'rank': 1 } // 'weight': -1
            },
            // Paginate over documents
            {
                $skip: skip // equiv to page
            },
            {
                $limit: limit // same as limit
            }

        ])
        .allowDiskUse(true)
        .exec();
        res.json(textAggregation);
    }catch(err){
        res.json({ message: err })
        logger.error('Failed to get text pagination results', {route: `/api/text/filter/${req.params.projectId}`});
    }
})


// Get candidate counts across all documents bucketed by their page number
// This is used for effort estimation for users
router.get('/overview/:projectId', async (req, res) => {
    //console.log('Getting candidate overview');
    try{
        const limit = parseInt(req.query.limit)
        //console.log('bucket size', limit);
        
        // Aggregation
        const textAggregation = await Text.aggregate([
            {
                $match: {  project_id: mongoose.Types.ObjectId(req.params.projectId) }
            },
            {
                $lookup: {
                    from: 'tokens', // need to use MongoDB collection name - NOT mongoose model name
                    localField: 'tokens.token',
                    foreignField: '_id',
                    as: 'tokens_detail'
                }
            },
            // Merges data in text model and that retrieved from the tokens collection into single object
            {
                $project: {
                    candidates: "$candidates",
                    tokens: {
                        $map : {
                            input: { $zip: { inputs: [ "$tokens", "$tokens_detail"]}},
                            as: "el",
                            in: {
                                $mergeObjects: [{"$arrayElemAt": [ "$$el", 0 ]}, {"$arrayElemAt": [ "$$el", 1 ] }]
                            }
                        }
                    }
                }
            },
            // To sort data based on the number of replacement candidates e.g. those that are not ds, en, abrv, unsure, etc.
            // First need to addField aggregated over these fields and then sort descending using the calculated field 
            {
                $addFields: {
                    candidates_bool: "$tokens.english_word"
                }
            },
            {
                $project:
                {
                    candidates: {
                        $map: {
                            input: "$candidates_bool",
                            as: "candidate",
                            in: {$cond: {if: "$$candidate", then: 0, else: 1}}  // 1 if not english word else 0 
                        }
                    }
                }
            },
            {
                $addFields: {
                    candidate_count: {$sum: "$candidates"}
                }
            },
            // Sort based on the number of candidates
            {
                $sort: {'candidate_count': -1} // -1 descending, 1 ascending
            },
            {
                $project: {
                    candidate_count: "$candidate_count"
                }
            }
        ])
        .allowDiskUse(true)
        .exec();

        // Chunk results based on limit
        // https://stackoverflow.com/questions/60007739/splitting-array-into-groups-using-typescript-javascript
        var chunks = [], i = 0;
        while (i < textAggregation.length) chunks.push(textAggregation.slice(i, i += parseInt(limit)));

        // If more than chunkLimit then return data for line-chart in react-vis otherwise return data for heatmap

        if (chunks.length > 50){
            // Line data - x: average candidate count for the texts on the given page, y: page number
            // Note: page number is indexed from 1 for readability.
            const data = chunks.map((page, pageNumber) => ({x: pageNumber+1, y: (page.map(text => text.candidate_count).reduce((a,b) => a+b, 0) / page.length)}))
            res.json({'type': 'line', 'data': data});

        } else {
            // Heat map data - x: text number, y: page number, color: count of candidates
            // Note: indexes are from 1 not 0 for readability.
            const data = chunks.map((page, pageNumber) => page.map((text, textIndex) => ({x: textIndex+1, y: pageNumber+1, color: text.candidate_count}))).flat()
            res.json({'type': 'heatmap', 'data': data});
        }

    }catch(err){
        res.json({ message: err })
    }
})


// Check if text has been annotated - if so, patch the annotated field on the text
// TODO: refactor
router.patch('/annotations/update', async (req, res) => {
    logger.info('Checking annotation states of texts', {route: '/api/text/annotations/update'})
    try{
        const textsRes = await Text.find({ _id : { $in: req.body.textIds}}).populate('tokens.token').lean();
        const checkTextState = (text) => {
            // Checks whether the tokens in a text have been annotated - if so, the text will be marked as annotated.
            // - Dont include token.token.english_word
            const textHasCandidates = text.tokens.filter(token => (
                token.token.unsure || token.token.sensitive || token.token.noise || token.token.abbreviation || token.token.domain_specific || token.token.replacement
                )).length > 0
            return textHasCandidates
        }
        const annotatedTextIds = textsRes.filter(text => checkTextState(text)).map(text => text._id);
        // Patch annotated field on texts
        const testUpdateRes = await Text.updateMany({ _id: { $in : annotatedTextIds}}, {annotated: true, last_modified: new Date(Date.now())})
        res.json(testUpdateRes);

    }catch(err){
        res.json({ message: err })
        logger.error('Failed to update annotation states of texts', {route: '/api/text/annotations/update'})
    }
})


// Tokenization - update single text
router.patch('/tokenize/', async (req, res) => {
    // Add new tokens to text whilst conserving original, unchanged, tokens.
    // Save tokenization artefact if possible, too!
    try{
        logger.info('Tokenizing one text', {route: `/api/text/tokenize/${req.params.textId}`});
        const text = await Text.findOne({ _id: req.body.text_id}).populate('tokens.token').lean();
        
        // Build current text from tokens and tokenize new string
        const oString = text.tokens.map(token => token.token.value).flat();
        const nString = req.body.new_string.split(' ');

        // Get indexes of unchanged tokens in oString
        const oTokensUnchgdIdxs = oString.flatMap((t, i) => (nString.includes(t) ? i : []))

        // Get indexes of changed tokens in nString
        const nTokensChgd = nString.flatMap((t, i) => (!oString.includes(t) ? t : []))
        const nTokensChgdIdxs = nString.flatMap((t, i) => (!oString.includes(t) ? i : []))

        // Create new tokens
        const enMap = await Map.findOne({ type: "en"}).lean();
        const enMapSet = new Set(enMap.tokens);

        // Here all historical info will be stripped from new tokens regardless of whether new combinations are in IV form
        const newTokenList = nTokensChgd.map(token => {
            return({
                    value: token,
                    meta_tags: { en: enMapSet.has(token) },
                    replacement: null,
                    suggested_replacement: null,
                    project_id: req.body.project_id
                    })
            });
        // Insert tokens into Token collection
        const tokenListRes = await Token.insertMany(newTokenList);

        // Build token array, assign indices and update text
        // // These are original tokens that remain unchanged, filtered by their index
        const oStringTokens = text.tokens.map(token => token.token).filter((e, i) => {return oTokensUnchgdIdxs.indexOf(i) !== -1});
        const oStringTokensPayload = {'tokens': oTokensUnchgdIdxs.map((originalIndex, sliceIndex) => ({'index': originalIndex, 'token': oStringTokens[sliceIndex]._id}))};
        
        // // Add new tokens to payload
        const nStringTokensPayload = {'tokens': nTokensChgdIdxs.map((originalIndex, sliceIndex) => ({'index': originalIndex, 'token': tokenListRes[sliceIndex]._id}))}

        // Combine both payloads into single object
        let tokensPayload = {'tokens': [...oStringTokensPayload['tokens'], ...nStringTokensPayload['tokens']]};

        // Sort combined payload by original index
        tokensPayload['tokens'] = tokensPayload['tokens'].sort((a,b) => a.index - b.index);
        // update indexes based on current ordering
        tokensPayload['tokens'] = tokensPayload.tokens.map((token, newIndex) => ({...token, index: newIndex}))

        // Update text tokens
        const updatedTextRes = await Text.findByIdAndUpdate({ _id: req.body.text_id}, tokensPayload, { new: true }).populate('tokens.token').lean();

        // convert text into same format as the paginator (this is expected by front-end components)
        const outputTokens = updatedTextRes.tokens.map(token => ({...token.token, index: token.index, token: token.token._id}))
        const outputText = {...updatedTextRes, tokens: outputTokens}

        // Remove old tokens in token collection (those removed from text)
        const oStringTokensRemoveIds = text.tokens.map(token => token.token).filter((e, i) => {return oTokensUnchgdIdxs.indexOf(i) == -1}).map(token =>token._id);
        await Token.deleteMany({ _id: oStringTokensRemoveIds});
        res.json(outputText)
        
    }catch(err){
        res.json({ message: err })
        logger.error('Failed to tokenize text', {route: `/api/text/tokenize/${req.params.textId}`});
    }


})

module.exports = router;