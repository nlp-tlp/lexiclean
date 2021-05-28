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

// Fetch projects for project feed
router.get('/feed', async(req, res) => {
    console.log('fetching projects for feed');
    try{
        // TODO: Add current token count to project feed response - currently being difficult

        const projects = await Project.find().populate('texts').lean();
        // .populate('texts.tokens.token')
        const feedInfo = projects.map(project => ({created_on: project.created_on,
            description: project.description,
            last_modified: project.last_modified,
            name: project.name,
            starting_token_count: project.starting_token_count,
            // current_token_count: project.texts.map(text => text.tokens.map(token => token.token.replacement ? token.token.replacement : token.token.value )).flat(),
            _id: project._id,
            text_count: project.texts.length,
            annotated_texts: project.texts.filter(text => text.annotated).length
        }))

        res.json(feedInfo)



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
        // console.log(enMap);

        // Build maps
        console.log('Building maps')
        const mapResponse = await Map.insertMany(req.body.maps);
        const dsMap = mapResponse.filter(map => map.type === 'ds')[0];
        const abrvMap = mapResponse.filter(map => map.type === 'abrv')[0];
        const rpMap = mapResponse.filter(map => map.type === 'rp')[0];

        // console.log(dsMap, abrvMap, enMap);

        // Build texts and tokens including filtering
        console.log('Building texts and tokens');

        // TOOD: review the use of lowercasing texts here. Should this be done or should
        // casing be kept but for matching to ds, en, rp the lowercasing be used?
        // removes white space between tokens as this will break the validation of the Token model.
        const normalisedTexts = req.body.texts.map(text => text.toLowerCase().replace(/\s+/g,' ').replace(/\.$/, '').trim()); 
        const tokenizedTexts = normalisedTexts.map(text => text.split(' '));
        
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
        const rpMapSet = new Set(Object.keys(rpMap.replacements[0]));

        // console.log('ds map set', dsMapSet)
        // console.log('rp map set',rpMapSet)


        console.log('Building token list');
        const tokenList = tokenizedTexts.flat().map((token, index) => {
            const domainSpecific = dsMapSet.has(token);
            const abbreviation = abrvMapSet.has(token);
            const englishWord = enMapSet.has(token);
            const hasReplacement = rpMapSet.has(token);

            // if(hasReplacement){
            //     console.log(token, 'replaced with', rpMap.replacements[0][token])
            // }

            return({
                    value: token,
                    domain_specific: domainSpecific,
                    abbreviation: abbreviation,
                    english_word: englishWord,
                    // Replacement is pre-filled if only replacement is found in map (user can remove in UI if necessary)
                    replacement: hasReplacement ? rpMap.replacements[0][token] : null,
                    suggested_replacement: null
                    })

            })

        console.log('token list length', tokenList.length);

        // console.log('tokens without value', tokenList.filter(token => !token.value).length)

        const tokenListResponse = await Token.insertMany(tokenList);

        // Build texts
        console.log('Building texts');
        const builtTexts = tokenTextMap.map((text, index) => {
            return({
                    // project_id: 'ph', // Cannot insert real project_id here as the project hasn't been created. This is done below as an updateMany. Uses placeholder is null. 
                    original: normalisedTexts[index],
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
        const tokenCount = new Set(tokenizedTexts.flat().map(token => token))

        const projectResponse = await Project.create({
            name: req.body.name,
            description: req.body.description,
            texts: textObjectIds,
            maps: mapObjectIds,
            starting_token_count: tokenCount.size
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

        console.log(projectResponse)
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


// Get count of unique tokens within project
router.get('/token-count/:projectId', async (req, res) => {
    console.log('Getting token count');
    try{
        const textRes = await Text.find({ project_id: req.params.projectId })
                                        .populate('tokens.token')
                                        .lean()

        const uniqueTokens = new Set(textRes.map(text => text.tokens.map(token => token.token.replacement ? token.token.replacement : token.token.value )).flat());

        res.json({'count': uniqueTokens.size});

    }catch(err){
        res.json({ message: err })
    }
})


// Download results
router.get('/results-download/:projectId', async (req, res) => {
    console.log('Preparing annotation results')
    try{
        const texts = await Text.find({ project_id : req.params.projectId }).populate('tokens.token').lean();
        console.log(texts[0])

        // Format results similar to WNUT 2015 (see: http://noisy-text.github.io/2015/norm-shared-task.html), with some modifications
        // {"tid": <text_id>, "input": [<token>, <token>, ...], "output": [<token>, <token>, ...], "class": [[<class_1>,<class_n>], [<class_1>,<class_n>], ...]}

        const results = texts.map(text => (
            {
                "tid": text._id,
                "input": text.tokens.map(token => token.token.value),
                // Here tokens marked with 'replace' should be converted to an empty string
                "output": text.tokens.map(token => token.token.removed ? '' : token.token.replacement ? token.token.replacement : token.token.value),
                "class": text.tokens.map(token => ([
                    ... token.token.domain_specific ? ["domain_specific"] : [],
                    ... token.token.abbreviation ? ["abbreviation"] : [],
                    ... token.token.english_word ? ["english_word"] : [],
                    ... token.token.noise ? ["noise"] : [],
                    ... token.token.sensitive ? ["sensitive"] : [],
                    ... token.token.unsure ? ["unsure"] : [],
                    ... token.token.removed ? ["removed"] : []
                ]))
            }
            
            ))


        res.json(results)

    }catch(err){
        res.json({ message: json })
    }
})


module.exports = router;