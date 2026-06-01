const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
require("dotenv").config({path: "./config.env"})
let sheetRoutes = express.Router()

const verifyToken = require("./verifyToken");

//#1 - Retrieve user's sheets
sheetRoutes.route("/sheets").get(verifyToken, async (request, response) => {
  let db = database.getDb();

  let data = await db
    .collection("sheets")
    .find({ userId: request.user.id })
    .toArray();

  response.json(data);
});

//#2 - Retrieve One
sheetRoutes.route("/sheets/:id").get(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("sheets").findOne({_id: new ObjectId(request.params.id)})
    if (Object.keys(data).length >0) {
        response.json(data)
    } else {
        throw new Error("Data was not found :(")
    }
})

//#3 - Create one
sheetRoutes.route("/sheets").post(verifyToken, async (request, response) => {
  let db = database.getDb();

  const newSheet = {
    ...request.body,
    userId: request.user.id,
    createdDate: new Date(),
  };

  const result = await db.collection("sheets").insertOne(newSheet);

  response.json({
    success: true,
    sheet: {
      ...newSheet,
      _id: result.insertedId,
    },
  });
});

module.exports = sheetRoutes