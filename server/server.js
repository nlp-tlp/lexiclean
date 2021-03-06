const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
require("dotenv/config"); // have access to .env

const { DB_HOST, DB_PORT, DB_NAME } = process.env;
const DB_CONNECTION = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Middleware
app.use(cors());
app.use(express.urlencoded({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/auth", [require("./routes/auth/auth")]);
app.use("/api/project", [
  require("./routes/project/project"),
  require("./routes/project/create"),
  require("./routes/project/download"),
]);
app.use("/api/map", [require("./routes/map/map")]);
app.use("/api/token", [require("./routes/token/token")]);
app.use("/api/text", [require("./routes/text/text")]);

// Add English lexicon to mongo db
const client = new MongoClient(DB_CONNECTION);

async function run() {
  try {
    await client.connect();

    const database = client.db("lexiclean");
    const maps = database.collection("maps");

    if (await maps.findOne({ type: "en" })) {
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
