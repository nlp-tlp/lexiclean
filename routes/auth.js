const express = require('express');
const router = express.Router();
// const User = require('../models/User');

// Create token
router.post('/login', async (req, res) => {
    try {
        res.send({token: 'test123'});   // res.send sends as plain text rather than json
    }catch(err){
        res.json({ message: err })
    }
});


module.exports = router;