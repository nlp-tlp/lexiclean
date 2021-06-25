const express = require('express');
const router = express.Router();
const logger = require('../logger');
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
    // Expects body of username, email and password
    logger.info('Signing up user', {route: '/signup'});
    try{
        // Check whether user exists
        const userExists = await User.exists({ username: req.body.username });
        if (userExists){
            res.status(409).send({ error: 'User already exists'});
            logger.error('User already exists', {route: '/signup'});
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
            logger.info('User created successfully', {route: '/signup'});
        }
    }catch(err){
        res.json({ message: err })
    }
})


// Login user
router.post('/login', async (req, res) => {
    // Expects body of username and password
    logger.info('Logging in user', {route: '/login'});
    try{
        // Check whether user exists
        const userExists = await User.exists({ username: req.body.username });
        if (!userExists){
            res.status(409).send({ error: 'User does not exist'});
            logger.error("User does not exist", {route: '/login'})
        } else {
            // Fetch user details
            const user = await User.findOne({ username: req.body.username }).lean();
            // Check if password is correct
            if (bcrypt.compareSync(req.body.password, user.password)){
                // password correct
                res.json({ username: user.username, token: generateJWT(user._id)})
                logger.info("Login successful", {route: '/login'})
            } else {
                res.status(409).send({ error: 'Password incorrect'});
                logger.warn("Incorrect password", {route: '/login'})
            }
        }
    }catch(err){
        res.json({ message: err })
    }
})

// Validate JWT token
router.post('/token/validate', async (req, res) => {
    logger.info('Validating JWT token', {route: '/token/validate'});
    try{
        jwt.verify(req.body.token, process.env.TOKEN_SECRET, function(err, decoded) {
            if (err){
                res.json({'valid': false})
                logger.error('Validation failed', {route: '/token/validate'});
            } else {
                res.json({ 'valid': true})
                logger.info('Validation successful', {route: '/token/validate'});
            }
        });
    }catch(err){
        res.json({ message: err })
    }
})


module.exports = router;