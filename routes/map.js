const express = require('express');
const router = express.Router();
const Map = require('../models/Map');
const StaticMap = require('../models/StaticMap');
const Text = require('../models/Text');


// Create map
router.post('/', async (req, res) => {
    console.log('Creating map');
    let map;
    if (req.body.tokens){
        console.log('Map uses token list')
        map = new Map({
            project_id: req.body.project_id,
            type: req.body.type,
            tokens: req.body.tokens
        });
    } else if (req.body.replacements){
        console.log('Map uses replacements')
        map = new Map({
            project_id: req.body.project_id,
            type: req.body.type,
            replacements: req.body.replacements
        })
    }

    try {
        const savedMap = await map.save();
        res.json(savedMap);
    }catch(err){
        res.json({ message: err })
    }
});

// Get Mapping using project id and mapping type
router.post('/one/:projectId', async(req, res) => {
    console.log(req.params, req.body);
    try{
        const response = await Map.findOne({project_id: req.params.projectId, type: req.body.type})
        res.json(response);

    }catch(err){
        res.json({ message: err })
    }
})

// Upload static map
router.post('/static/', async (req, res) => {
    console.log('Adding static map')
    
    const map = new StaticMap({
        type: req.body.type,
        tokens: req.body.tokens
    })
    
    try{
        const savedMap = await map.save()
        res.json(savedMap)
    }catch(err){
        res.json({ message: err })
    }
})

// Download map
router.post('/download/:projectId', async (req, res) => {
    try{    
        console.log(`Downloading ${req.body.mapName} mapping`)
        
        // Get tokens
        const textResponse = await Text.find({project_id: req.params.projectId}).populate('tokens.token').lean();
        // console.log(textResponse)
        const tokens = textResponse.map(text => text.tokens.map(token => token.token)).flat();
        // console.log(tokens);
        
        // Filter tokens for those annotated with map
        const tokensMapped = tokens.filter(token => token[req.body.mapName])
        // console.log(tokensMapped);

        // Filter for unique values only.
        const tokenValues = [... new Set(tokensMapped.map(token => token.value))];
        // console.log(tokenValues);

        res.json({[req.body.mapName]: tokenValues})

    }catch(err){
        res.json({ message: err })
    }
})


module.exports = router;