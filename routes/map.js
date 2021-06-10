const express = require('express');
const router = express.Router();
const Map = require('../models/Map');
const Text = require('../models/Text');
const Project = require('../models/Project');


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
    
    const map = new Map({
        type: req.body.type,
        tokens: req.body.tokens,
        colour: req.body.colour
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


// Get maps associated to project
router.get('/:projectId', async (req, res) => {
    console.log('Fetching maps for project');
    // Here additional classes and colours are defined. TODO: integrate into front-end so the user is aware of these decisions.
    try{
        const response = await Project.find({_id: req.params.projectId}).populate('maps');
        const maps = response[0].maps;
        // console.log('map response', maps);

        // Restructure maps from arary of maps to object of maps with keys based on map type
        const mapsRestructured = Object.assign(...maps.map(map => ({[map.type]: map})));
        
        const mapKeys = [...Object.keys(mapsRestructured), "ua", "st", "en"]  // ua - unassigned, st - suggested token, en - english word
        let colourMap = Object.assign(...maps.map(map => ({[map.type]: map.colour})));
        colourMap = {...colourMap, "ua": "#F2A477", "st": "#6BB0BF", "en": "#D9D9D9"}
        res.json({"contents": mapsRestructured, "map_keys": mapKeys, "colour_map": colourMap});

    }catch(err){
        res.json({ message: err })
    }
})


module.exports = router;