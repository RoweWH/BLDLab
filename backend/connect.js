const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config({
  path: path.resolve(__dirname, "config.env"),
});

const atlasUri = process.env.ATLAS_URI;

if (!atlasUri) {
  throw new Error("ATLAS_URI environment variable is not configured.");
}

const client = new MongoClient(atlasUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

module.exports = {
  connectToServer: async () => {
    if (database) {
      return database;
    }

    await client.connect();
    database = client.db("BLDLab");

    console.log("Connected to MongoDB");

    return database;
  },

  getDb: () => {
    if (!database) {
      throw new Error("MongoDB has not been connected yet.");
    }

    return database;
  },
};