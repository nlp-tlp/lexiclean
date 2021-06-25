const { MongoClient } = require('mongodb');
require('dotenv/config');   // have access to .env
const fs = require('fs');

const uri = process.env.DB_CONNECTION;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        const database = client.db("lexiclean");
        const maps = database.collection("maps");

        const rawData = fs.readFileSync('en_lexicon.json');
        const doc = JSON.parse(rawData);
        const result = await maps.insertOne(doc[0]);

        console.log(
            `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`
        );
    } finally {
        await client.close();
    }
}

run().catch(console.dir());