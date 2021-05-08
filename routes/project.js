const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Data = require('../models/Data');
const Map = require('../models/Map');
const Text = require('../models/Text');
const Token = require('../models/Token');


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


// Create project v2
router.post('/create_v2', async (req, res) => {
    console.log('creating project v2')
    try{

        // Build maps
        console.log('Building maps')
        console.log(req.body.maps)
        const mapResponse = await Map.insertMany(req.body.maps);

        const dsMap = mapResponse.filter(map => map.type === 'ds')[0];
        const abrvMap = mapResponse.filter(map => map.type === 'abrv')[0];
        const enMap = mapResponse.filter(map => map.type === 'en')[0];

        console.log(dsMap, abrvMap, enMap);

        // Build texts and tokens including filtering
        console.log('Building texts and tokens');

        // TOOD: review the use of lowercasing texts here. Should this be done or should
        // casing be kept but for matching to ds, en, rp the lowercasing be used?
        const tokenizedTexts = req.body.texts.map(text => text.toLowerCase().split(' '));
        console.log(tokenizedTexts)
        
        // Need to keep order and association to texts when processing tokens
        // .flat()
        const textList = tokenizedTexts.map((text, textIndex) => {
            return({
                [textIndex] : text.map(token => {
                const domainSpecific = dsMap.tokens.includes(token)
                const abbreviation = abrvMap.tokens.includes(token)
                const englishWord = enMap.tokens.includes(token)
                return({
                        value: token,
                        domain_specific: domainSpecific,
                        abbreviation: abbreviation,
                        english_word: englishWord
                        })
                    })
                })
            });
        console.log('tokens', textList);

        let globalTokenIndex = -1;  // this is used to index the tokenlist that is posted to mongo as a flat list when reconstructing texts
        const tokenTextMap = tokenizedTexts.map((text, textIndex) => text.map((token, tokenIndex) => {
            globalTokenIndex += 1;
            return(
                {
                    value: token,
                    index: tokenIndex,
                    text: textIndex,
                    globalTokenIndex: globalTokenIndex 
                })
            })
        );

        console.log(tokenTextMap);

        const tokenList = tokenizedTexts.flat().map(token => {
            const domainSpecific = dsMap.tokens.includes(token)
            const abbreviation = abrvMap.tokens.includes(token)
            const englishWord = enMap.tokens.includes(token)
            return({
                    value: token,
                    domain_specific: domainSpecific,
                    abbreviation: abbreviation,
                    english_word: englishWord
                    })
            })

        console.log(tokenList);

        const tokenListResponse = await Token.insertMany(tokenList);
        console.log('token list response',tokenListResponse)



        // Build texts
        const builtTexts = tokenTextMap.map(text => {
            return({
                    tokens: text.map(token => {
                        return({
                            index: token.index, 
                            token: tokenListResponse[token.globalTokenIndex]._id
                        })
                    })
                })   
        });

        console.log(builtTexts);

        // Create texts
        const textResponse = await Text.insertMany(builtTexts);


        // Build project
        const textObjectIds = textResponse.map(text => text._id);
        const mapObjectIds = mapResponse.map(map => map._id);

        const projectResponse = await Project.create({
            name: req.body.projectName,
            description: req.body.projectDescription,
            texts: textObjectIds,
            maps: mapObjectIds
        })



        // Return
        res.json(projectResponse)



    }catch(err){
        res.json({ message: err })
    }
})

module.exports = router;