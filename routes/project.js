const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Map = require('../models/Map');
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
// Review - this is slow.
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

        // Load static English map (shared for all projects)
        console.log('Loading English map')
        const enMap = await Map.findOne({ type: "en"}).lean();

        // Build maps
        console.log('Building maps')
        const mapResponse = await Map.insertMany(req.body.maps);
        const rpMap = mapResponse.filter(map => map.type === 'rp')[0];  // this should always be present in the maps
        
        // Build texts and tokens including filtering
        console.log('Building texts and tokens');
        
        // TOOD: review the use of lowercasing texts here. Should this be done or should
        // casing be kept but for matching to ds, en, rp the lowercasing be used?
        // removes white space between tokens as this will break the validation of the Token model.
        const normalisedTexts = req.body.texts.map(text => text.toLowerCase()
                                                               .replace('\t', ' ')
                                                               .replace(/["',?;!:\(\)\[\]_\{\}\*]/g, ' ')
                                                               .replace(/\s+/g,' ')
                                                               .replace(/\.$/, '')
                                                               .trim()); 
        // remove texts that are empty after normalisation
        const filteredTexts = normalisedTexts.filter(text => text.length > 0).map(text => text);
        // tokenize
        const tokenizedTexts = filteredTexts.map(text => text.split(' '));
        
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

        // Convert maps to Sets
        let mapSets = Object.assign(...mapResponse.map(map => ({[map.type]: new Set(map.tokens)}))) // TODO: include construction of rp map instead of doing separately. use ternary.
        mapSets['rp'] = new Set(Object.keys(rpMap.replacements[0]));
        mapSets['en'] = new Set(enMap.tokens);
        // console.log('map sets -> ', mapSets);    // too large with enMap


        // regex digit match (TODO: improve to match digits better)
        const re = /^\d+$/g;

        console.log('Building token list');
        const tokenList = tokenizedTexts.flat().map((token, index) => {
            let metaTags = Object.assign(...Object.keys(mapSets).filter(key => key !== 'rp').map(key => ({[key]: mapSets[key].has(token)})));
            const hasReplacement = mapSets.rp.has(token);
            // check if token is digit - if so, classify as English
            const isDigit = token.match(re) !== null;
            metaTags = isDigit ? {...metaTags, 'en': true}: metaTags;
            
            if (token === ''){
                console.log(tokenizedTexts.flat().slice(index-10, index+10))
            }

            return({
                    value: token,
                    meta_tags: metaTags,
                    replacement: hasReplacement ? rpMap.replacements[0][token] : null,
                    suggested_replacement: null,
                    active: true
                    })
            })

        console.log('token list length', tokenList.length);
        
        console.log('tokens without value', tokenList.filter(token => !token.value).length)

        console.log('token without value', tokenList.filter(token => !token.value));

        const tokenListResponse = await Token.insertMany(tokenList);

        // Build texts
        console.log('Building texts');
        const builtTexts = tokenTextMap.map((text, index) => {
            return({
                    // project_id: 'ph', // Cannot insert real project_id here as the project hasn't been created. This is done below as an updateMany. Uses placeholder is null. 
                    original: filteredTexts[index],
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
        const candidateTokens = tokenListResponse.filter(token => (Object.values(token.meta_tags).filter(tagBool => tagBool).length === 0 && !token.replacement)).map(token => token.value)

        const projectResponse = await Project.create({
            name: req.body.name,
            description: req.body.description,
            texts: textObjectIds,
            maps: mapObjectIds,
            metrics: {
                starting_vocab_size: tokenCount.size,
                starting_oov_token_count: candidateTokens.length
            }
        })
        const projectId = projectResponse._id;

        // Update tokens with project_id fields
        const tokensUpdated = await Token.updateMany({ _id: { $in: tokenListResponse.map(token => token._id)}}, { project_id: projectId }, { upsert: true });

        // Update texts in texts collection with project_id field
        const textsUpdateResponse = await Text.updateMany({ _id: { $in: textObjectIds }}, {project_id: projectId}, {upsert: true});


        // IMPLEMENT TF-IDF ALGORITHM
        console.log('Calculating TF-IDF scores')
        // - Update texts in texts collection with their inverse tf-idf weight
        let counts = {};
        let keys = [];

        for (var i = 0; i < tokenizedTexts.length; i++){
            var text = tokenizedTexts[i];

            for (var j = 0; j < text.length; j++){
                var token = text[j];
                if (counts[token] === undefined){
                    counts[token] = {
                        tf: 1,
                        df: [i] // used to capture index of texts term appears in
                    };
                    keys.push(token);
                } else {
                    counts[token].tf = counts[token].tf + 1;
                    if (!counts[token].df.includes(i)){
                        counts[token].df.push(i);
                    }
                }
            }
        }

        // Aggregate doc counts into df e.g. {key: {tf: #, df #}}
        Object.keys(counts).map(key => (counts[key].tf = counts[key].tf, counts[key].df = counts[key].df.length));
        // console.log(counts);

        // Compute tf-idf scores for each token; not assignment is used to flatten array of objects.
        // console.log('tokenized texts length', tokenizedTexts.length)
        const tfidfs = Object.assign(...Object.keys(counts).map(key => ({[key]: (counts[key].tf === 0 || tokenizedTexts.length / counts[key].df === 0) ? 0 : counts[key].tf * Math.log10(tokenizedTexts.length / counts[key].df)})));
        // console.log(tfidfs);

        // Compute average document tf-idf
        // - 1. get set of candidate tokens (derived up-stream)
        // - 2. filter texts for only candidate tokens
        // - 3. compute filtered text average tf-idf score/weight

        const candidateTokensUnique = new Set(candidateTokens)

        // 2. cannot use set operations here as there can be duplicates in the tokenized text; note filter at the end is to remove the nulls
        // console.log(tokenListResponse)
        const textsWithTokensPopulated = textResponse.map(text => ({_id: text._id, tokenizedText: text.tokens.map(token => tokenListResponse.filter(resToken => resToken._id === token.token).map(token => token.value)).flat()}))
        // console.log('texts with candidate tokens', textsWithTokensPopulated.length);

        const textTokenWeights = textsWithTokensPopulated.map(text => ({_id: text._id, tokenWeights: text.tokenizedText.filter(token => candidateTokensUnique.has(token)).map(token => tfidfs[token])}))
        // If text has no token weights, give its aggregate value an incredibly high number (10000).
        // Note: text weight is a sum rather than average. THis is because we want to identify when multiple, high, tfidf tokens are present rather than averaging them out.
        const textWeights = textTokenWeights.map(text => ({_id: text._id, weight: text.tokenWeights.length > 0 ? text.tokenWeights.reduce((a, b) => a + b) : -1}));

        // Add weight to text
        // - create update objects
        console.log('Updating texts with TF-IDF scores')
        const bwTextWeightObjs = textWeights.map(text => ({updateOne: { filter: { _id: text._id}, update: {weight: text.weight}, options: {upsert: true}}}));
        console.log('bulk write text objects created - writing to database')
        const bwTextResponse = await Text.bulkWrite(bwTextWeightObjs);

        // Return
        // res.json('Project created successfully.')
        res.json({'word tfids': tfidfs})

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
                                        .lean();
        
        


        const uniqueTokens = new Set(textRes.map(text => text.tokens.map(token => token.token.replacement ? token.token.replacement : token.token.value )).flat());

        // Unlike on project creation, the other meta-tags need to be checked such as removed, noise, etc.
        const allTokens = textRes.map(text => text.tokens.map(token => token.token)).flat();
        const candidateTokens = allTokens.filter(token => (Object.values(token.meta_tags).filter(tagBool => tagBool).length === 0 && !token.replacement)).map(token => token.value)

        res.json({'vocab_size': uniqueTokens.size, 'oov_tokens': candidateTokens.length});

    }catch(err){
        res.json({ message: err })
    }
})


// Download results
router.get('/download/result/:projectId', async (req, res) => {
    console.log('Preparing annotation results')
    try{
        const texts = await Text.find({ project_id : req.params.projectId }).populate('tokens.token').lean();
        // Format results similar to WNUT 2015 (see: http://noisy-text.github.io/2015/norm-shared-task.html), with some modifications
        // {"tid": <text_id>, "input": [<token>, <token>, ...], "output": [<token>, <token>, ...], "class": [[<class_1>,<class_n>], [<class_1>,<class_n>], ...]}
        const results = texts.map(text => (
            {
                "tid": text._id,
                "input": text.tokens.map(token => token.token.value),
                // Here tokens marked with 'replace' should be converted to an empty string
                "output": text.tokens.map(tokenInfo => tokenInfo.token.removed ? '' : tokenInfo.token.replacement ? tokenInfo.token.replacement : tokenInfo.token.value),
                "class": text.tokens.map(tokenInfo => tokenInfo.token.meta_tags)
            }
        ))
        res.json(results)
    }catch(err){
        res.json({ message: json })
    } 
})


// Download maps and lists
// builds replacement map
// builds domain-specific terms, noise, abbreviation, sensitive, and unsure lists
router.get('/maps-download/:projectId', async (req, res) => {
    console.log('Preparing project maps');
    try{

        // Fetch texts and then strip markups from tokens on texts
        const texts = await Text.find({ project_id: req.params.projectId }).populate('tokens.token').lean();
        console.log(texts[0])

        // build replacement map - currently array of objects (TODO: build 1-to-N objects)
        // note: filter removes nulls
        const replacements = texts.map(text => text.tokens.map(token => token.token.replacement ? {[token.token.value]: token.token.replacement} : null)).flat().filter(ele => ele)

        // Build lists
        // note: filter removes nulls
        // set is used to get unique tokens
        const dsList = [...new Set(texts.map(text => text.tokens.map(token => (token.token.domain_specific && token.token.replacement) ? token.token.replacement : token.token.domain_specific ? token.token.value : null)).flat().filter(ele => ele))]
        const noiseList = [...new Set(texts.map(text => text.tokens.map(token => (token.token.noise && token.token.replacement) ? token.token.replacement : token.token.noise ? token.token.value : null)).flat().filter(ele => ele))]
        const abrvList = [...new Set(texts.map(text => text.tokens.map(token => (token.token.abbreviation && token.token.replacement) ? token.token.replacement : token.token.abbreviation ? token.token.value : null)).flat().filter(ele => ele))]
        const sensitiveList = [...new Set(texts.map(text => text.tokens.map(token => (token.token.sensitive && token.token.replacement) ? token.token.replacement : token.token.sensitive ? token.token.value : null)).flat().filter(ele => ele))]
        const unsureList = [...new Set(texts.map(text => text.tokens.map(token => (token.token.unsure && token.token.replacement) ? token.token.replacement : token.token.unsure ? token.token.value : null)).flat().filter(ele => ele))]

        const output = {
            'replacement_map': replacements,
            'domain_specific_tokens': dsList,
            'noise_tokens': noiseList,
            'abbreviation_tokens': abrvList,
            'sensitive_tokens': sensitiveList,
            'unsure_tokens': unsureList,
        }

        res.json(output);


    }catch(err){
        res.json({ message: err })
    }
})

module.exports = router;