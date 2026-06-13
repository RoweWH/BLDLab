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

//#4 - Update one
sheetRoutes.route("/sheets/:id").put(verifyToken, async (request, response) => {
  let db = database.getDb();

  const { _id, userId, createdDate, ...updatedSheet } = request.body;

  const result = await db.collection("sheets").updateOne(
    {
      _id: new ObjectId(request.params.id),
      userId: request.user.id,
    },
    {
      $set: {
        ...updatedSheet,
        updatedDate: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return response.status(404).json({
      success: false,
      message: "Sheet not found",
    });
  }

  response.json({
    success: true,
    modifiedCount: result.modifiedCount,
  });
});