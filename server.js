const express = require('express');
const app = express();
var cors = require('cors')
const mongoose = require('mongoose');
require('dotenv/config');   // have access to .env

// import routes
const projectsRoute = require('./routes/project');
const dataRoute = require('./routes/data');
const resultRoute = require('./routes/results');
const mapRoute = require('./routes/map');

// Middleware
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/project', projectsRoute)
app.use('/api/data', dataRoute)
app.use('/api/results', resultRoute)
app.use('/api/map', mapRoute)


// Connect to mongo db
mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true },
    () => { console.log('Connected to db!')});


// Create listener
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));