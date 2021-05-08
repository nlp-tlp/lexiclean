const express = require('express');
const router = express.Router();
const Data = require('../models/Data');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// NEED INSERT MANY SO WE CAN SLAP X DOCS INTO DATA COLLECTION
router.post('/upload', async (req, res) => {
    console.log('Uploading data')
    const projectId = req.body.project_id;
    const data = req.body.data;
    // Tokenize texts and build payloads
    const dataPayload = data.map((text) => {
        // Build tokenized data
        const tokenizedText = text.split(' ');
        const tokenData = tokenizedText.map((token, index) => {return({index: index, token: token})})
        return({
            project_id: projectId,
            tokens: tokenData
        })
    })
    
    try{
        const savedDataMany = await Data.insertMany(dataPayload)
        res.json(savedDataMany);
    }catch(err){
        res.json({ message: err })
    }
})


// GET DATA FILTERED BY PROJECT ID
router.get('/:projectId', async (req, res) => {
    console.log('Fetching data using project id');
    
    try {
        const data = await Data.find({ project_id: req.params.projectId });
        res.json(data);
    }catch(err){
        res.json({ message: err})
    }
})


// PAGINATE DATA FILTERED BY PROJECT ID
// Sorts data based on if it has been annotated
// Note: sending limit of 0 returns meta-data of paginator
// If any issues arise with results - refer to: https://github.com/aravindnc/mongoose-aggregate-paginate-v2/issues/18
// TODO: Add sort functionality (this will require patching data with annotated status when results are patched)
router.get('/:projectId/filter/', async (req, res) => {
    console.log('Paginating through data');
    console.log(req.query);
    try {
        // Paginate Aggregation
        const dataAggregate = Data.aggregate([
            {
                $match: { project_id: mongoose.Types.ObjectId(req.params.projectId)}
            },
            // {
            //     $sort: {'annotated': 1}
            // },
        ])

        const options = {page: req.query.page, limit: req.query.limit}
        const data = await Data.aggregatePaginate(dataAggregate, options)    
        res.json(data);
        
    }catch(err){
        res.json({ message: err })
    }
})


// Patch one token
router.post('/one/:tokenId', async (req, res) => {
    try{
        const response = await Data.find({"tokens._id": req.params.tokenId})
        
        const tokenInfo = response[0].tokens.filter(token => token._id == req.params.tokenId)[0];
        console.log(tokenInfo);
        // Update token information
        console.log(req.body.field, req.body.value)
        const field = req.body.field;
        const value = req.body.value;
        // Note spreading response will give ALL the meta data too, so need to acces just the doc
        const tokenInfoUpdated = {...tokenInfo._doc, [field]: value}
        console.log(tokenInfoUpdated)

        // TODO: update model with new information...
        // const updatedReponse = await Data.updateOne({"tokens._id": req.params.tokenId}, })
        

        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
})

// Get one token
router.get('/one/:tokenId', async (req, res) => {
    try{
        const response = await Data.find({"tokens._id": req.params.tokenId})
        console.log(response);
        const tokenInfo = response[0].tokens.filter(token => token._id == req.params.tokenId)[0];
        console.log(tokenInfo);
        res.json(tokenInfo)
    }catch(err){
        res.json({ message: err })
    }
})


// **********************************************************************







// GET ALL DATA CORRESPONDING TO LIST OF PROJECT IDS
// projectIds -> phaseIds -> docIds
router.post('/all/', async (req, res) => {
    try{
        const projectIdList = req.body.projectIds;
        console.log('project ids list', projectIdList);

        // Aggregate all phases associated to projects
        const projectResponse = await Project.find({ _id: { $in : projectIdList} })
                                                .lean()

        console.log('project response', projectResponse);
        
        let projectPhaseList = projectResponse.map((project) => project.phases.map((phase) => {return({[project._id]: phase._id})}))
        // projectPhaseList is a list of lists of objects...
        console.log(projectPhaseList);
        // Merge phaseList
        projectPhaseList = [].concat.apply([], projectPhaseList);
        console.log(projectPhaseList);

        // Separate phases into list for querying data collection
        const phaseList = projectPhaseList.map((pair) => Object.values(pair)[0]);
        const data = await Data.find({ project_phase_id: { $in: phaseList } });

        res.json(data);
    }catch(err){
        res.json({ message: err })
    }

})




// CREATE DOC
router.post('/', async (req, res) => {
    const data = new Data({
        project_id: req.body.project_id,
        source: req.body.source,
        target: req.body.target
    });

    try {
        const savedData = await data.save();
        res.json(savedData);
    }catch(err){
        res.json({ mesage: err })
    }
});


module.exports = router;