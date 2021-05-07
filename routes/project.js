const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Data = require('../models/Data');
const Map = require('../models/Map');


// Create Project
router.post('/', async (req, res) => {
    console.log('creating project')
    const project = new Project({
        name: req.body.name,
        description: req.body.description,
    });
    try {
        const savedProject = await project.save();
        res.json(savedProject);
    }catch(err){
        console.log(err);
        res.json({ mesage: err })
    }
});


// Fetch projects
router.get('/', async (req, res) => {
    console.log('fetching projects');
    try{
        const projects = await Project.find();
        res.json(projects);
    }catch(err){
        res.json({ message: err })
    }
})


// Create Project and fill with data
router.post('/create', async (req, res) => {
    console.log('creating project with data and maps')

    try {
        console.log('building project')
        const project = new Project({
            name: req.body.name,
            description: req.body.description, 
        });
        const savedProject = await project.save();
        const projectId = savedProject._id
        console.log('project response', savedProject)
        

        console.log('uploading data')
        const data = req.body.textData;
        
        // Tokenize texts and build payloads
        const dataPayload = data.map((text) => {
            // Build tokenized data
            const tokenizedText = text.split(' ');
            const tokenData = tokenizedText.map((token, index) => {return({index: index, token: token})})
            // console.log(tokenData);
            return({
                project_id: projectId,
                tokens: tokenData
            })

        })

        console.log(dataPayload);
        const savedDataMany = await Data.insertMany(dataPayload)
        console.log('data response', savedDataMany)


        console.log('uploading maps');
        // const enWordsMap = new Map({
        //     project_id: projectId,
        //     type: 'english_words',
        //     tokens: req.body.enWordsData
        // })
        // const savedEnWordsMap = await enWordsMap.save();

        // console.log('ds word data', req.body.dsWordsData)
        // console.log('project id', projectId);

        const dsWordsMap = new Map({
            project_id: projectId,
            type: 'ds_tokens',
            tokens: req.body.dsWordsData
        })
        console.log(dsWordsMap);
        const savedDsWordsMap = await dsWordsMap.save();
        console.log('ds response', savedDsWordsMap)

        res.json('successfully created project');
    }catch(err){
        console.log(err);
        res.json({ mesage: err })
    }
});

// UPDATE PROJECT
router.patch('/:projectId', async (req, res) => {
    try{
        const updatedProject = await Project.updateOne(
            { _id: req.params.projectId },
            { $set: { title: req.body.title }}
            );
        res.json(updatedProject);
    }catch(err){
        res.json({ message: err })
    }
})

module.exports = router;