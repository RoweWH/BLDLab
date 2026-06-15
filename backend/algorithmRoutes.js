const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
require("dotenv").config({path: "./config.env"})
let algorithmRoutes = express.Router()

const verifyToken = require("./verifyToken");

//#1 - Retrieve user's algorithms
algorithmRoutes.route("/algorithms").get(verifyToken, async (request, response) => {
  let db = database.getDb();

  let data = await db
    .collection("algorithms")
    .find({ userId: request.user.id })
    .toArray();

  response.json(data);
});

//#2 - Retrieve One
algorithmRoutes.route("/algorithms/:id").get(verifyToken, async (request, response) => {
  let db = database.getDb();

  let data = await db.collection("algorithms").findOne({
    _id: new ObjectId(request.params.id),
    userId: request.user.id,
  });

  if (data) {
    response.json(data);
  } else {
    response.status(404).json({
      success: false,
      message: "Algorithm not found",
    });
  }
});

 //#3 - Create one
algorithmRoutes.route("/algorithms").post(verifyToken, async (request, response) => {
  let db = database.getDb();

  const newAlgorithm = {
    ...request.body,
    userId: request.user.id,
    createdDate: new Date(),
  };

  const result = await db.collection("algorithms").insertOne(newAlgorithm);

  response.status(201).json({
    ...newAlgorithm,
    _id: result.insertedId,
  });
});

//#4 - Update one
algorithmRoutes.route("/algorithms/:id").put(verifyToken, async (request, response) => {
  let db = database.getDb();

  const { _id, userId, createdDate, ...updatedAlgorithm } = request.body;

  const result = await db.collection("algorithms").updateOne(
    {
      _id: new ObjectId(request.params.id),
      userId: request.user.id,
    },
    {
      $set: {
        ...updatedAlgorithm,
        updatedDate: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return response.status(404).json({
      success: false,
      message: "Algorithm not found",
    });
  }

  response.json({
    success: true,
    modifiedCount: result.modifiedCount,
  });
});

//#5 - Delete one
algorithmRoutes.route("/algorithms/:id").delete(verifyToken, async (request, response) => {
  let db = database.getDb();

  const result = await db.collection("algorithms").deleteOne({
    _id: new ObjectId(request.params.id),
    userId: request.user.id,
  });

  if (result.deletedCount === 0) {
    return response.status(404).json({
      success: false,
      message: "Algorithm not found",
    });
  }

  response.json({
    success: true,
    deletedCount: result.deletedCount,
  });
});


module.exports = algorithmRoutes