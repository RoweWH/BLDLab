const express = require("express");
const database = require("./connect");
const verifyToken = require("./verifyToken");
const verifyAdmin = require("./verifyAdmin");
const ObjectId = require("mongodb").ObjectId;

let adminRoutes = express.Router();

//#1 - Get pending algorithms
adminRoutes
  .route("/admin/algorithms")
  .get(verifyToken, verifyAdmin, async (request, response) => {
    let db = database.getDb();

    const algorithms = await db
      .collection("algorithms")
      .find({ status: "pending" })
      .toArray();

    response.json(algorithms);
  });

  adminRoutes
  .route("/admin/algorithms/:id/status")
  .put(verifyToken, verifyAdmin, async (request, response) => {
    let db = database.getDb();

    const result = await db.collection("algorithms").updateOne(
      { _id: new ObjectId(request.params.id) },
      {
        $set: {
          status: request.body.status,
          reviewedDate: new Date(),
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
      status: request.body.status,
    });
  });

module.exports = adminRoutes;