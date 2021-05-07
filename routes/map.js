const express = require('express');
const router = express.Router();
const Map = require('../models/Map');

// Create Mapping
router.post('/', async (req, res) => {
    const map = new Map({
        project_id: req.body.project_id,
        type: req.body.type,
        tokens: req.body.tokens
    });

    try {
        const savedMap = await map.save();
        res.json(savedMap);
    }catch(err){
        res.json({ message: err })
    }
});

// Get Mapping using project id and mapping type
router.post('/:projectId', async(req, res) => {
    console.log(req.params, req.body);
    try{
        const response = await Map.find({project_id: req.params.projectId, type: req.body.type})
        // Should return a single value...
        res.json(response[0]);

    }catch(err){
        res.json({ message: err })
    }
})


module.exports = router;