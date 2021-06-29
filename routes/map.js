const express = require('express');
const router = express.Router();
const logger = require('../logger');
const Map = require('../models/Map');
const Text = require('../models/Text');
const Token = require('../models/Token');
const Project = require('../models/Project');


// Create map
router.post('/', async (req, res) => {
    logger.info('Creating map', {route: '/api/map/'});
    try {
        map = new Map({
            project_id: req.body.project_id,
            type: req.body.type,
            colour: req.body.colour,
            active: true
        });
        
        await Project.findByIdAndUpdate({ _id: req.body.project_id }, {$push: {"maps": map._id}}, {upsert: true});
        const savedMap = await map.save();
        res.json(savedMap);
    }catch(err){
        res.json({ message: err })
        logger.error('Map creation failed', {route: '/api/map/'});
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
        logger.info(`Downloading ${req.body.mapName} mapping`, {route: `/api/map/download/${req.params.projectId}`});
        
        // Get tokens
        const tokens = await Token.find({ project_id: req.params.projectId }).lean();
        // console.log(tokens);

        if (req.body.mapName === 'rp'){
            // Filter tokens for those with replacements
            const tokensReplaced = tokens.filter(token => token.replacement);
            console.log('Tokens replaced -> ', tokensReplaced.length);

            const replacementPairs = tokensReplaced.map(token => ({token: token.value, replacement: token.replacement}));
            console.log(replacementPairs[1])

            // Filter out duplicate replacements
            const uniqueReplacementPairs = replacementPairs.filter((thing, index, self) => 
                index === self.findIndex((t) => (
                    t.token === thing.token && t.replacement === thing.replacement
                ))
            )
            
            console.log('Unique replacement pairs -> ', uniqueReplacementPairs);

            // Convert to token:replacement for
            const replacements = uniqueReplacementPairs.map(pair => ({[pair.token] : pair.replacement})).reduce(((r, c) => Object.assign(r, c)), {});

            // console.log(replacements)

            res.json(replacements)


        } else {
            // Filter tokens for those annotated with map
            const tokensMapped = tokens.filter(token => token.meta_tags[req.body.mapName])
            // console.log(tokensMapped);
    
            // Filter for unique values only.
            const tokenValues = [... new Set(tokensMapped.map(token => token.replacement ? token.replacement : token.value))];
            // console.log(tokenValues);
            res.json({'values': tokenValues})
        }
        


    }catch(err){
        res.json({ message: err })
        logger.error(`Failed to download ${req.body.mapName} mapping`, {route: `/api/map/download/${req.params.projectId}`});
    }
})


// Get maps associated to project
router.get('/:projectId', async (req, res) => {
    // Here additional classes and colours are defined. TODO: integrate into front-end so the user is aware of these decisions.
    logger.info('Fetching project maps', {route: `/api/map/${req.params.projectId}`});
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
        logger.info('Failed to fetch project maps', {route: `/api/map/${req.params.projectId}`});
    }
})


// Modify active state of map
router.post('/status/:mapId', async (req, res) => {
    logger.info('Updating map status', {route: `/api/map/status/${req.params.mapId}`});
    try{
        const mapResponse = await Map.findByIdAndUpdate({ _id : req.params.mapId}, { active: req.body.activeStatus});
        res.json('Update successful')
    }catch(err){
        res.json({ message: err })
        logger.info('Failed to update map status', {route: `/api/map/status/${req.params.mapId}`});
    }
})


module.exports = router;