const express = require('express');
const app = express();
var cors = require('cors')

// Middleware
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// import routes
// const projectsRoute = require('./routes/projects');

// app.use('/api/projects', projectsRoute)

// Create listener
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));