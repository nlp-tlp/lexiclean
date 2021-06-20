const express = require('express');
const app = express();
var cors = require('cors')
const mongoose = require('mongoose');
require('dotenv/config');   // have access to .env

// import routes
const authRoute = require('./routes/auth');
const projectsRoute = require('./routes/project');
const mapRoute = require('./routes/map');
const tokenRoute = require('./routes/token');
const textRoute = require('./routes/text');


// Middleware
app.use(cors())
app.use(express.urlencoded({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit: '50mb'}));

app.use('/api/auth', authRoute)
app.use('/api/project', projectsRoute)
app.use('/api/map', mapRoute)
app.use('/api/token', tokenRoute)
app.use('/api/text', textRoute)


// Connect to mongo db
mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true },
    () => { console.log('Connected to db!')});


// Create listener
const port = 3001;
app.listen(port, () => console.log(`Server started on port ${port}`));