const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Data = require('../models/Data');


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