const express = require('express');
const router = express.Router();
const Text = require('../models/Text');
const mongoose = require('mongoose');

// NEED INSERT MANY SO WE CAN SLAP X DOCS INTO DATA COLLECTION
router.post('/upload', async (req, res) => {
    console.log('Uploading texts')
    
    // tokens is an array of objects
    const texts = req.body.texts;
    console.log(texts);

    // Will need to load the map and use it to markup fields on the tokens (this will be done in another route)

    try{
        const response = await Text.insertMany(texts)
        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
})

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
    // console.log(req.query);
    try {

        const skip = parseInt((req.query.page - 1) * req.query.limit)
        const limit = parseInt(req.query.limit)

        console.log(skip, limit);


        // Paginate Aggregation
        const textAggregation = await Text.aggregate([
            {
                $match: { 
                    project_id: mongoose.Types.ObjectId(req.params.projectId), 
                    // annotated: false
                }
            },
            // COMMENTED OUT SECTION BELOW WAS USED FOR CANDIDATE CAPTURING AND FILTERING. THIS IS REMOVED IN PLACE OF TF-IDF
            // {
            //     $lookup: {
            //         from: 'tokens', // need to use MongoDB collection name - NOT mongoose model name
            //         localField: 'tokens.token',
            //         foreignField: '_id',
            //         as: 'tokens_detail'
            //     }
            // },
            // // Merges data in text model and that retrieved from the tokens collection into single object
            // {
            //     $project: {
            //         annotated: "$annotated",
            //         candidates: "$candidates",
            //         tokens: {
            //             $map : {
            //                 input: { $zip: { inputs: [ "$tokens", "$tokens_detail"]}},
            //                 as: "el",
            //                 in: {
            //                     $mergeObjects: [{"$arrayElemAt": [ "$$el", 0 ]}, {"$arrayElemAt": [ "$$el", 1 ] }]
            //                 }
            //             }
            //         }
            //     }
            // },
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
                $sort: {'annotated': -1, 'weight': 1}   // weight is sorted smallest to highest
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

        console.log(req.body.textIds)

        const textsRes = await Text.find({ _id : { $in: req.body.textIds}}).populate('tokens.token').lean();


        const checkTextState = (text) => {
            // Checks whether the tokens in a text have been annotated - if so, the text will be marked
            // as annotated.


            //  dont include token.token.english_word
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


module.exports = router;