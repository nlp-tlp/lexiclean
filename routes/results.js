const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Data = require('../models/Data');
const Project = require('../models/Project');


// GET RESULT FILTERED BY PROJECT AND DOC ID
router.get('/:projectId', async (req, res) => {
    try {
        // Get data using project id and then search results
        // Unsure if using project id in the results would be a more efficient method?
        const data = await Data.find({ project_id: req.params.projectId });
        const doc_ids = data.map((doc) => doc._id);
        const result = await Result.find({ "doc_id": { $in: doc_ids } });
        res.json(result);
    }catch(err){
        res.json({ message: err})
    }
})

// GET SINGLE RESULT BY DOC ID
router.get('/single/:docId', async (req, res) => {
    try{
        const result = await Result.find({ "doc_id": req.params.docId})
                                    .populate('schema_list_element_id')
                                    .lean();
        res.json(result);
    }catch(err){
        res.json({ message: err })
    }
})


// GET RESULTS BY LIST OF phaseIds
router.post('/all', async (req, res) => {
    try{
        // Get docs using list of phase ids and then search results
        const phaseIds = req.body.phaseIds;
        const dataResponse = await Data.find({ project_phase_id: { $in : phaseIds}}).lean();
        const docIds = dataResponse.map(data => data._id);
        const result = await Result.find({ "doc_id": { $in: docIds } });
        console.log(result)
        res.json(result);

    }catch(err){
        res.json({ message: err })
    }

})


// CREATE ONE RESULT
router.post('/', async (req, res) => {
    const result = new Result({
        doc_id: req.body.doc_id,
        created_by: req.body.created_by,
        schema_id: req.body.schema_id,
        schema_list_element_id: req.body.schema_list_element_id
    });
    try {
        const savedResult = await result.save();
        res.json(savedResult);
    }catch(err){
        res.json({ mesage: err })
    }
});

// CREATE MANY RESULTS
// TODO: REVIEW
// Need to do patch due to the nature of annotation
// if users change result the result needs to be updated...
// Volume is low so it should be okay...
// TODO: IF another user posts result on same doc_id then it overrides anyone else
// It doesn't create new docs...
router.patch('/add-many/', async (req, res) => {
    console.log('Adding many results');

    try {
        const resultPayload = req.body.result_list;

        console.log(resultPayload);
        
        let response;
        for (const result of resultPayload){
            console.log('inserting', result);
            response = await Result.updateOne({ doc_id: result.doc_id, created_by: result.created_by}, result, {upsert: true})
        }
        res.json(response);
    }catch(err){
        res.json({ mesage: err })
    }
});

// Patch single document using docId as filter
router.patch('/:docId', async (req, res) => {
    // docId is the data instance that is related to the result...

    try {
        console.log(Date.now())
        const updatedResult = await Result.updateOne(
            { doc_id: req.params.docId },
            { $set: { result: req.body.result, last_modified: Date.now() }}
            );
        res.json(updatedResult);
    }catch(err){
        res.json({ message: err })
    }
})


module.exports = router;