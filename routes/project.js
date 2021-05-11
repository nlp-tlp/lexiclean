const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Map = require('../models/Map');
const StaticMap = require('../models/StaticMap');

const Text = require('../models/Text');
const Token = require('../models/Token');


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

// Fetch single project
router.get('/:projectId', async (req, res) => {
    try{
        const response = await Project.findOne({ _id: req.params.projectId})
        res.json(response);
    }catch(err){
        res.json({ message: err })
    }
} )



// Create project
router.post('/create', async (req, res) => {
    console.log('creating project')
    try{

        // Load static English map
        console.log('Loading English map')
        const enMap = await StaticMap.findOne({ type: "en"}).lean();
        console.log(enMap);

        // Build maps
        console.log('Building maps')
        const mapResponse = await Map.insertMany(req.body.maps);
        const dsMap = mapResponse.filter(map => map.type === 'ds')[0];
        const abrvMap = mapResponse.filter(map => map.type === 'abrv')[0];

        // console.log(dsMap, abrvMap, enMap);

        // Build texts and tokens including filtering
        console.log('Building texts and tokens');

        // TOOD: review the use of lowercasing texts here. Should this be done or should
        // casing be kept but for matching to ds, en, rp the lowercasing be used?
        // removes white space between tokens as this will break the validation of the Token model.
        const tokenizedTexts = req.body.texts.map(text => text.toLowerCase().replace(/\s+/g,' ').replace(/\.$/, '').trim().split(' '));
        
        let globalTokenIndex = -1;  // this is used to index the tokenlist that is posted to mongo as a flat list when reconstructing texts
        const tokenTextMap = tokenizedTexts.map((text, textIndex) => text.map((token, tokenIndex) => {
            globalTokenIndex += 1;
            return(
                {
                    value: token,
                    index: tokenIndex,
                    textIndex: textIndex,
                    globalTokenIndex: globalTokenIndex 
                })
            })
        );

        // console.log(tokenTextMap);

        // Convert maps to Sets
        const dsMapSet = new Set(dsMap.tokens);
        const abrvMapSet = new Set(abrvMap.tokens);
        const enMapSet = new Set(enMap.tokens);

        console.log('Building token list');
        const tokenList = tokenizedTexts.flat().map((token, index) => {
            const domainSpecific = dsMapSet.has(token);
            const abbreviation = abrvMapSet.has(token);
            const englishWord = enMapSet.has(token);

            return({
                    value: token,
                    domain_specific: domainSpecific,
                    abbreviation: abbreviation,
                    english_word: englishWord,
                    replacement: null, // TODO: pre-populate with existing dictionaries in the future.
                    suggested_replacement: null // TODO: pre-populate with existing dictionaries in the future.
                    })

            })

        console.log('token list length', tokenList.length);

        // console.log('tokens without value', tokenList.filter(token => !token.value).length)

        const tokenListResponse = await Token.insertMany(tokenList);

        // Build texts
        console.log('Building texts');
        const builtTexts = tokenTextMap.map(text => {
            return({
                    // project_id: 'ph', // Cannot insert real project_id here as the project hasn't been created. This is done below as an updateMany. Uses placeholder is null. 
                    tokens: text.map(token => {
                        return({
                            index: token.index,
                            token: tokenListResponse[token.globalTokenIndex]._id
                        })
                    })
                })   
        });

        // console.log(builtTexts);

        // Create texts
        console.log('creating many texts')
        const textResponse = await Text.insertMany(builtTexts);

        // Build project
        console.log('Building project');
        const textObjectIds = textResponse.map(text => text._id);
        const mapObjectIds = mapResponse.map(map => map._id);

        const projectResponse = await Project.create({
            name: req.body.name,
            description: req.body.description,
            texts: textObjectIds,
            maps: mapObjectIds
        })


        // Update texts in texts collection with project_id field
        const projectId = projectResponse._id;
        const textsUpdateResponse = await Text.updateMany({ _id: { $in: textObjectIds }}, {project_id: projectId}, {upsert: true});


        // Return
        // res.json(textsUpdateResponse)
        res.json('Project created successfully.')



    }catch(err){
        res.json({ message: err })
    }
})



// Get maps associated to project
router.get('/maps/:projectId', async (req, res) => {
    console.log('getting maps');
    try{
        const response = await Project.find({_id: req.params.projectId}).populate('maps');
        const maps = response[0].maps;
        // console.log('map response', maps);

        // Restructure maps from arary of maps to object of maps with keys based on map type
        let mapsRestructured = maps.map(map => {return({[map.type]: map})});
        mapsRestructured = Object.assign(...mapsRestructured)
        res.json(mapsRestructured);

    }catch(err){
        res.json({ message: err })
    }
})



// Delete project
router.delete('/:projectId', async (req, res) => {
    console.log('deleting project');
    try{
        const projectResponse = await Project.findOne({_id: req.params.projectId}).populate('texts')

        // Get ids of associated documents
        const textIds = projectResponse.texts.map(text => text._id);
        const tokenIds = projectResponse.texts.map(text => text.tokens.map(token => token.token)).flat();
        const mapIds = projectResponse.maps;

        // Delete documents in collections
        const projectDelete = await Project.deleteOne({ _id: req.params.projectId })
        const textDelete = await Text.deleteMany({ _id: textIds})
        const tokenDelete = await Token.deleteMany({ _id: tokenIds})
        const mapDelete = await Map.deleteMany({ _id: mapIds})



        res.json('Successfully deleted project.')


    }catch(error){
        res.json({ message: err })
    }
})

module.exports = router;