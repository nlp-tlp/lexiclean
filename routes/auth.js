const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

// Get config variables
dotenv.config();

const generateJWT = (user_id) => {
    // 24hr expiry
    // console.log(username, process.env.TOKEN_SECRET);
    return jwt.sign({'user_id': user_id}, process.env.TOKEN_SECRET, { expiresIn: '24h' })
}

// Create user
router.post('/signup', async (req, res) => {
    console.log('Signing up user');
    // Expects body of username, email and password
    try{
        console.log(req.body);

        // Check whether user exists
        const userExists = await User.exists({ username: req.body.username });

        if (userExists){
            res.json({ message: 'user already exists'});
        } else {

            // hash password with bcrypt
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(req.body.password, salt);

            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hash
            })
            const savedUser = await newUser.save();
            
            res.json({'username': req.body.username, token: generateJWT(savedUser._id)});
        }

    }catch(err){
        res.json({ message: err })
    }
})


// Login user
router.post('/login', async (req, res) => {
    console.log('Logging in user');
    // Expects body of username and password
    try{

        // Check whether user exists
        const userExists = await User.exists({ username: req.body.username });

        if (!userExists){
            res.json({ message: 'user does not exist'});
        } else {
            console.log('user exists');
            // if exists - check whether password entered is correct w/ bcrypt
            // if password correct issue jwt token

            // Fetch user details
            const user = await User.findOne({ username: req.body.username }).lean();

            // Check if password is correct
            if (bcrypt.compareSync(req.body.password, user.password)){
                // password correct
                res.json({ username: user.username, token: generateJWT(user._id)})
            } else {
                res.json('incorrect password')
            }

        }


    }catch(err){
        res.json({ message: err })
    }
})

// Validate JWT token
router.post('/token/validate', async (req, res) => {
    console.log('validating jwt');
    try{
        jwt.verify(req.body.token, process.env.TOKEN_SECRET, function(err, decoded) {
            if (err){
                // res.json(err)
                res.json({'valid': false})
            } else {
                console.log(decoded.user_id);
                res.json({ 'valid': true})
            }
        });
    }catch(err){
        res.json({ message: err })
    }
})


module.exports = router;