const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
require("dotenv/config"); // have access to .env

const { DB_HOST,
DB_PORT,
DB_NAME} = process.env;

const DB_CONNECTION = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`


// import routes
const authRoute = require("./routes/auth");
const projectsRoute = require("./routes/project");
const mapRoute = require("./routes/map");
const tokenRoute = require("./routes/token");
const textRoute = require("./routes/text");

// Middleware
app.use(cors());
app.use(express.urlencoded({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRoute);
app.use("/api/project", projectsRoute);
app.use("/api/map", mapRoute);
app.use("/api/token", tokenRoute);
app.use("/api/text", textRoute);

// Add English lexicon to mongo db
const client = new MongoClient(DB_CONNECTION);

async function run() {
  try {
    await client.connect();

    const database = client.db("lexiclean");
    const maps = database.collection("maps");

    if (await maps.findOne({"type": "en"})){
        // pass
    } else {
        const rawData = fs.readFileSync("en_lexicon.json");
        const doc = JSON.parse(rawData);
        const result = await maps.insertOne(doc[0]);
        console.log(
          `English lexicon was added to collection with the _id: ${result.insertedId}`
        );
    }
  } finally {
    await client.close();
  }
}

run().catch(console.dir());


// Connect to mongo db
mongoose.connect(DB_CONNECTION, { useNewUrlParser: true }, () => {
  console.log("Connected to db!");
});

// Create listener
const port = 3001;
app.listen(port, () => console.log(`Server started on port ${port}`));
