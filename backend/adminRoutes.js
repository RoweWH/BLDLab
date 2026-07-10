const express = require("express");
const database = require("./connect");
const verifyToken = require("./verifyToken");
const verifyAdmin = require("./verifyAdmin");
const { ObjectId } = require("mongodb");

const adminRoutes = express.Router();

const REVIEW_STATUSES = new Set(["public", "rejected"]);

// Get pending algorithms
adminRoutes
  .route("/admin/algorithms")
  .get(verifyToken, verifyAdmin, async (request, response) => {
    try {
      const db = database.getDb();

      const algorithms = await db
        .collection("algorithms")
        .find({ status: "pending" })
        .sort({ createdDate: 1 })
        .toArray();

      response.json(algorithms);
    } catch (error) {
      console.error("Failed to retrieve pending algorithms:", error);

      response.status(500).json({
        success: false,
        message: "Failed to retrieve pending algorithms",
      });
    }
  });

// Approve or reject an algorithm
adminRoutes
  .route("/admin/algorithms/:id/status")
  .put(verifyToken, verifyAdmin, async (request, response) => {
    try {
      if (!ObjectId.isValid(request.params.id)) {
        return response.status(400).json({
          success: false,
          message: "Invalid algorithm id",
        });
      }

      const { status, BLDLabId } = request.body;

      if (!REVIEW_STATUSES.has(status)) {
        return response.status(400).json({
          success: false,
          message: "Status must be public or rejected",
        });
      }

      if (status === "public" && BLDLabId == null) {
        return response.status(400).json({
          success: false,
          message: "BLDLabId is required when approving an algorithm",
        });
      }

      const db = database.getDb();
      const currentDate = new Date();

      const update = {
        status,
        BLDLabId: status === "public" ? BLDLabId : null,
        reviewedDate: currentDate,
        updatedDate: currentDate,
      };

      const result = await db.collection("algorithms").findOneAndUpdate(
        {
          _id: new ObjectId(request.params.id),
          status: "pending",
        },
        {
          $set: update,
        },
        {
          returnDocument: "after",
        },
      );

      if (!result) {
        return response.status(404).json({
          success: false,
          message: "Pending algorithm not found",
        });
      }

      response.json({
        success: true,
        _id: result._id,
        status: result.status,
        BLDLabId: result.BLDLabId,
        reviewedDate: result.reviewedDate,
        updatedDate: result.updatedDate,
      });
    } catch (error) {
      console.error("Failed to update algorithm status:", error);

      response.status(500).json({
        success: false,
        message: "Failed to update algorithm status",
      });
    }
  });

module.exports = adminRoutes;