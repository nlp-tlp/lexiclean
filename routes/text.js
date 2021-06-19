const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Text = require('../models/Text');
const Token = require('../models/Token');


// get single text
router.get('/:textId', async (req, res) => {
    try{
        const response = await Text.findOne({ _id: req.params.textId})
                                    .populate('tokens.token');
        res.json(response);
    }catch(err){
        res.json({ message: err })
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


// Get number of annotated documents
router.get('/progress/:projectId', async (req, res) => {
    console.log('Getting progress');
    try{
        const textsAnnotated = await Text.find({ project_id: req.params.projectId, annotated: true}).count();
        const textsTotal = await Text.find({project_id: req.params.projectId}).count();
        res.json({
            "annotated": textsAnnotated,
            "total": textsTotal
        })
    }catch(err){
        res.json({ message: err })
    }
})



// Get number of total pages for paginator
router.get('/filter/pages/:projectId', async (req, res) => {
    console.log('getting number of pages for paginator')
    try{
        const textsCount = await Text.find({ project_id : req.params.projectId}).count();
        const pages = Math.ceil(textsCount/req.query.limit);
        res.json({"totalPages": pages})
    }catch(err){
        res.json({ message: err })
    }
})


// PAGINATE DATA FILTERED BY PROJECT ID
// If any issues arise with results - refer to: https://github.com/aravindnc/mongoose-aggregate-paginate-v2/issues/18
// TODO: Add sort functionality (this will require patching data with annotated status when results are patched)
router.get('/filter/:projectId', async (req, res) => {
    console.log('Paginating through texts');
    try {
        const skip = parseInt((req.query.page - 1) * req.query.limit)
        const limit = parseInt(req.query.limit)
        // console.log(skip, limit);

        // Paginate Aggregation
        const textAggregation = await Text.aggregate([
            {
                $match: { 
                    project_id: mongoose.Types.ObjectId(req.params.projectId), 
                    // annotated: false
                }
            },
            // COMMENTED OUT SECTION BELOW WAS USED FOR CANDIDATE CAPTURING AND FILTERING. THIS IS REMOVED IN PLACE OF TF-IDF
            {
                $lookup: {
                    from: 'tokens', // need to use MongoDB collection name - NOT mongoose model name
                    localField: 'tokens.token',
                    foreignField: '_id',
                    as: 'tokens_detail'
                }
            },
            // // Merges data in text model and that retrieved from the tokens collection into single object
            {
                $project: {
                    annotated: "$annotated",
                    // candidates: "$candidates",
                    weight: "$weight",
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
            // // To sort data based on the number of replacement candidates e.g. those that are not ds, en, abrv, unsure, etc.
            // // First need to addField aggregated over these fields and then sort descending using the calculated field 
            // {
            //     $addFields: {
            //         candidates_bool: "$tokens.english_word"
            //     }
            // },
            // {
            //     $project:
            //     {
            //         annotated: "$annotated",
            //         tokens: "$tokens",
            //         candidates: {
            //             $map: {
            //                 input: "$candidates_bool",
            //                 as: "candidate",
            //                 in: {$cond: {if: "$$candidate", then: 0, else: 1}}  // 1 if not english word else 0 
            //             }
            //         }
            //     }
            // },
            // {
            //     $addFields: {
            //         candidate_count: {$sum: "$candidates"}
            //     }
            // },

            // Sort based on the number of candidates
            // Note: sort order is left to right
            // Note doing sequential sorts just overrides the n-1 sort operation.
            // TODO: also sort by the first token alphabetically.
            // 
            {
                // $sort: {'annotated': -1, 'candidate_count': -1} // -1 descending, 1 ascending
                $sort: {'annotated': -1, 'weight': -1}   // weight is sorted smallest to highest
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


        // const response = await Text.aggregatePaginate(textAggregation, options);
        // res.json(response);
        
    }catch(err){
        res.json({ message: err })
    }
})


// Get candidate counts across all documents bucketed by their page number
// This is used for effort estimation for users
// TODO: REVIEW
router.get('/overview/:projectId', async (req, res) => {
    console.log('Getting candidate overview');
    try{
        const limit = parseInt(req.query.limit)
        console.log('bucket size', limit);
        
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
router.patch('/check-annotations/', async (req, res) => {
    console.log('Checking annotation states of texts')
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
        const testUpdateRes = await Text.updateMany({ _id: { $in : annotatedTextIds}}, {"annotated": true})
        res.json(testUpdateRes);

    }catch(err){
        res.json({ message: err })
    }
})


// Tokenization - update single text
// This requires special logic to determine which tokens changed
router.patch('/tokenize/:textId', async (req, res) => {
    console.log('Updating tokenization of a single text')
    try{
        const projectId = req.body.project_id;

        const newString = req.body.new_string;
        const textResponse = await Text.findOne({ _id: req.params.textId}).populate('tokens.token').lean();
        // TODO: review whether it makes sense to map the replacements (if available)
        const originalTokenMap = Object.assign(...textResponse.tokens.map((token, index) => ({[index]: token.token.replacement ? token.token.replacement : token.token.value})))
        const originalString = Object.values(originalTokenMap).join(' ')
        
        // console.log(newString === originalString ? 'NO CHANGE IN STRING' : 'CHANGE DETECTED IN STRINGS')
        console.log(originalTokenMap)

        // Detect modified tokens - new string should have LESS tokens than the original.
        let tokenCandidates = originalString.split(' ');
        const diffs = tokenCandidates.map((token, index) => {
            const substringMatch = newString.split(' ').filter(newToken => newToken.includes(token))[0];
            if (substringMatch && substringMatch !== token){
                // Remove matched token from candidates (tokens can only be used once..)
                tokenCandidates = tokenCandidates.filter(candidateToken => candidateToken !== token);
                return(
                    {
                        "newToken": substringMatch,
                        "originalIndex": null,
                        "oldToken": {
                            "index": index,
                            "value": token
                        }
                    }
                )
            } else {
                return(
                    {
                        "newToken": token,
                        "originalIndex": index,
                        "oldToken": {}
                    }
                )
            }
        }).filter(ele => ele);   // filter used to remove nulls

        console.log('diffs', diffs)

        // Remove tokens that have been tokenized propery and add the new token into the correct spot
        const map = new Map(diffs.map(({newToken, originalIndex, oldToken}) => [newToken, { newToken, originalIndex, oldToken: [] }])); 
        for (let {newToken, originalIndex, oldToken} of diffs) map.get(newToken).oldToken.push(...[oldToken].flat());
        const diffsFormatted = [...map.values()]
        console.log('diffsFormatted -> ', diffsFormatted)
        
        
        // This works, but may fail if there are multiple changes to the SAME token? TODO: review.
        const tokensToAdd = diffsFormatted.map(diff => ({"index": newString.split(' ').indexOf(diff.newToken), "value": diff.newToken, "originalIndex": diff.originalIndex}))
        console.log('tokensToAdd -> ', tokensToAdd)
        
        
        // add new tokens to tokens array
        // first need to create new tokens in Token collection (this includes loading maps - TODO! etc.)
        const tokenList = tokensToAdd.map(token => {
            // const metaTags = Object.assign(...Object.keys(mapSets).filter(key => key !== 'rp').map(key => ({[key]: mapSets[key].has(token)})));
            // const hasReplacement = mapSets.rp.has(token);

            if (token.originalIndex){
                // Tokens that are not modified are simply copied 
                const origTokenResponse = textResponse.tokens.filter(tokenOrig => tokenOrig.index === token.originalIndex)[0].token;
                return({
                    value: origTokenResponse.value,
                    meta_tags: origTokenResponse.meta_tags,
                    suggested_replacement: origTokenResponse.suggested_replacement,
                    suggested_meta_tags: origTokenResponse.suggested_meta_tags,
                    project_id: origTokenResponse.project_id
                }
                )
            } else {
                return({
                        value: token.value,
                        meta_tags: {en: false},      // TODO: figure out how to capture the correct meta-tags for this. (DEFAULTING TO UA - user can reassign)
                        // Replacement is pre-filled if only replacement is found in map (user can remove in UI if necessary)
                        replacement: null,
                        suggested_replacement: null,
                        project_id: projectId
                        })
            }

            })
        
        console.log('token list -> ', tokenList);

        const tokenListResponse = await Token.insertMany(tokenList);
        console.log('tokenListResponse -> ', tokenListResponse);

        
        console.log('Updating text');
        // // NOTE: (TODO)  - weights do not get updated when tokenization is performed. This is because tokens may be OOV for tf-id.       
        
        const textUpdatePayload = {'tokens': tokenListResponse.map((token, index) => ({'index': index, 'token': token._id}))}
        console.log('textUpdatePayload ->', textUpdatePayload)

        // Update by writing over tokens
        const textResponseAfterAddition = await Text.findByIdAndUpdate({ _id: req.params.textId}, textUpdatePayload, {new: true}).populate('tokens.token').lean();
        console.log('textResponseAfterAddition -> ', textResponseAfterAddition)

        // convert text into same format as the paginator (this is expected by front-end components)
        const outputTokens = textResponseAfterAddition.tokens.map(token => ({...token.token, index: token.index, token: token.token._id}))
        // console.log('output tokens->', outputTokens);
        const outputText = {...textResponseAfterAddition, tokens: outputTokens}
        // console.log(outputText)
        res.json(outputText)

        // TODO: Still need to capture the changes in the token_tokenized field...



    }catch(err){
        res.json({ message: err })
    }
})


module.exports = router;