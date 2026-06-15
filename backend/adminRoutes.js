const express = require("express");
const database = require("./connect");
const verifyToken = require("./verifyToken");
const verifyAdmin = require("./verifyAdmin");

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

module.exports = adminRoutes;