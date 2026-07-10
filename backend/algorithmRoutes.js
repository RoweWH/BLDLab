const express = require("express");
const crypto = require("crypto");
const database = require("./connect");
const { ObjectId } = require("mongodb");
const verifyToken = require("./verifyToken");

require("dotenv").config({
  path: "./config.env",
});

const algorithmRoutes = express.Router();

const OWNER_STATUSES = new Set([
  "private",
  "pending",
]);

function normalizeOwnerStatus(
  status,
  fallback = "private",
) {
  return OWNER_STATUSES.has(status)
    ? status
    : fallback;
}

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function createGuestSubmissionKey() {
  return crypto.randomBytes(32).toString("hex");
}

function hashGuestSubmissionKey(key) {
  return crypto
    .createHash("sha256")
    .update(String(key))
    .digest("hex");
}

function isValidAlgorithmBody(body) {
  return (
    body.caseId != null &&
    normalizeText(body.caseType) &&
    normalizeText(body.algorithm)
  );
}

/*
 * Logged-in algorithms
 */

algorithmRoutes
  .route("/algorithms")
  .get(verifyToken, async (request, response) => {
    try {
      const db = database.getDb();

      const algorithms = await db
        .collection("algorithms")
        .find({
          userId: request.user.id,
        })
        .toArray();

      response.json(algorithms);
    } catch (error) {
      console.error(
        "Failed to retrieve user algorithms:",
        error,
      );

      response.status(500).json({
        success: false,
        message:
          "Failed to retrieve algorithms",
      });
    }
  });

algorithmRoutes
  .route("/algorithms")
  .post(verifyToken, async (request, response) => {
    try {
      if (!isValidAlgorithmBody(request.body)) {
        return response.status(400).json({
          success: false,
          message:
            "caseId, caseType, and algorithm are required",
        });
      }

      const db = database.getDb();
      const currentDate = new Date();

      const newAlgorithm = {
        userId: request.user.id,

        caseId: request.body.caseId,
        caseType: normalizeText(
          request.body.caseType,
        ),
        algorithm: normalizeText(
          request.body.algorithm,
        ),

        status: normalizeOwnerStatus(
          request.body.status,
        ),

        BLDLabId: null,

        createdDate: currentDate,
        updatedDate: currentDate,
        reviewedDate: null,
      };

      const result = await db
        .collection("algorithms")
        .insertOne(newAlgorithm);

      response.status(201).json({
        ...newAlgorithm,
        _id: result.insertedId,
      });
    } catch (error) {
      console.error(
        "Failed to create user algorithm:",
        error,
      );

      response.status(500).json({
        success: false,
        message:
          "Failed to create algorithm",
      });
    }
  });

/*
 * Guest submissions
 */

algorithmRoutes
  .route("/algorithms/guest")
  .post(async (request, response) => {
    try {
      if (!isValidAlgorithmBody(request.body)) {
        return response.status(400).json({
          success: false,
          message:
            "caseId, caseType, and algorithm are required",
        });
      }

      const db = database.getDb();
      const currentDate = new Date();

      const submissionKey =
        createGuestSubmissionKey();

      const newAlgorithm = {
        userId: null,

        caseId: request.body.caseId,
        caseType: normalizeText(
          request.body.caseType,
        ),
        algorithm: normalizeText(
          request.body.algorithm,
        ),

        status: "pending",
        BLDLabId: null,

        guestKeyHash:
          hashGuestSubmissionKey(
            submissionKey,
          ),

        createdDate: currentDate,
        updatedDate: currentDate,
        reviewedDate: null,
      };

      const result = await db
        .collection("algorithms")
        .insertOne(newAlgorithm);

      response.status(201).json({
        submissionId: result.insertedId,
        submissionKey,

        status: newAlgorithm.status,
        BLDLabId: newAlgorithm.BLDLabId,

        createdDate:
          newAlgorithm.createdDate,
        updatedDate:
          newAlgorithm.updatedDate,
        reviewedDate:
          newAlgorithm.reviewedDate,
      });
    } catch (error) {
      console.error(
        "Failed to create guest algorithm submission:",
        error,
      );

      response.status(500).json({
        success: false,
        message:
          "Failed to create guest algorithm submission",
      });
    }
  });

algorithmRoutes
  .route("/algorithms/guest/status")
  .post(async (request, response) => {
    try {
      const db = database.getDb();
      const { submissionIds } = request.body;

      if (!Array.isArray(submissionIds)) {
        return response.status(400).json({
          success: false,
          message:
            "submissionIds must be an array",
        });
      }

      const validSubmissionIds =
        submissionIds
          .map((id) => String(id))
          .filter((id) =>
            ObjectId.isValid(id),
          )
          .map((id) => new ObjectId(id));

      if (validSubmissionIds.length === 0) {
        return response.json([]);
      }

      const submissions = await db
        .collection("algorithms")
        .find({
          _id: {
            $in: validSubmissionIds,
          },
          userId: null,
        })
        .project({
          status: 1,
          BLDLabId: 1,
          updatedDate: 1,
          reviewedDate: 1,
        })
        .toArray();

      response.json(
        submissions.map((submission) => ({
          submissionId:
            submission._id,

          status: submission.status,

          BLDLabId:
            submission.BLDLabId ?? null,

          updatedDate:
            submission.updatedDate ?? null,

          reviewedDate:
            submission.reviewedDate ?? null,
        })),
      );
    } catch (error) {
      console.error(
        "Failed to retrieve guest submission statuses:",
        error,
      );

      response.status(500).json({
        success: false,
        message:
          "Failed to retrieve guest submission statuses",
      });
    }
  });

algorithmRoutes
  .route("/algorithms/guest/:id")
  .put(async (request, response) => {
    try {
      if (
        !ObjectId.isValid(request.params.id)
      ) {
        return response.status(400).json({
          success: false,
          message:
            "Invalid submission id",
        });
      }

      const submissionKey =
        request.body.submissionKey;

      if (
        typeof submissionKey !== "string" ||
        !submissionKey
      ) {
        return response.status(401).json({
          success: false,
          message:
            "Guest submission key is required",
        });
      }

      const db = database.getDb();

      const existingAlgorithm = await db
        .collection("algorithms")
        .findOne({
          _id: new ObjectId(
            request.params.id,
          ),
          userId: null,
          guestKeyHash:
            hashGuestSubmissionKey(
              submissionKey,
            ),
        });

      if (!existingAlgorithm) {
        return response.status(404).json({
          success: false,
          message:
            "Guest submission not found",
        });
      }

      if (
        existingAlgorithm.status === "public"
      ) {
        return response.status(409).json({
          success: false,
          message:
            "Public algorithms cannot be edited or made private",
        });
      }

      const algorithm =
        normalizeText(
          request.body.algorithm,
        );

      if (!algorithm) {
        return response.status(400).json({
          success: false,
          message:
            "Algorithm is required",
        });
      }

      const status =
        normalizeOwnerStatus(
          request.body.status,
        );

      const currentDate = new Date();

      const result = await db
        .collection("algorithms")
        .findOneAndUpdate(
          {
            _id: existingAlgorithm._id,
            userId: null,
            status: {
              $ne: "public",
            },
          },
          {
            $set: {
              algorithm,
              status,

              /*
               * A resubmitted or private algorithm is no longer
               * carrying the previous rejection result.
               */
              BLDLabId: null,
              reviewedDate: null,
              updatedDate: currentDate,
            },
          },
          {
            returnDocument: "after",
          },
        );

      if (!result) {
        return response.status(409).json({
          success: false,
          message:
            "The submission could not be updated",
        });
      }

      response.json({
        submissionId: result._id,
        status: result.status,

        BLDLabId:
          result.BLDLabId ?? null,

        updatedDate:
          result.updatedDate ?? null,

        reviewedDate:
          result.reviewedDate ?? null,
      });
    } catch (error) {
      console.error(
        "Failed to update guest submission:",
        error,
      );

      response.status(500).json({
        success: false,
        message:
          "Failed to update guest submission",
      });
    }
  });

algorithmRoutes
  .route("/algorithms/guest/:id")
  .delete(async (request, response) => {
    try {
      if (
        !ObjectId.isValid(request.params.id)
      ) {
        return response.status(400).json({
          success: false,
          message:
            "Invalid submission id",
        });
      }

      const submissionKey =
        request.body?.submissionKey;

      if (
        typeof submissionKey !== "string" ||
        !submissionKey
      ) {
        return response.status(401).json({
          success: false,
          message:
            "Guest submission key is required",
        });
      }

      const db = database.getDb();

      const existingAlgorithm = await db
        .collection("algorithms")
        .findOne({
          _id: new ObjectId(
            request.params.id,
          ),
          userId: null,
          guestKeyHash:
            hashGuestSubmissionKey(
              submissionKey,
            ),
        });

      if (!existingAlgorithm) {
        return response.status(404).json({
          success: false,
          message:
            "Guest submission not found",
        });
      }

      /*
       * Once public, the Mongo submission is preserved.
       * The frontend will still delete the guest's local copy.
       */
      if (
        existingAlgorithm.status === "public"
      ) {
        return response.json({
          success: true,
          publicPreserved: true,
          deletedCount: 0,
        });
      }

      const result = await db
        .collection("algorithms")
        .deleteOne({
          _id: existingAlgorithm._id,
          userId: null,
          status: {
            $ne: "public",
          },
        });

      response.json({
        success: true,
        publicPreserved: false,
        deletedCount:
          result.deletedCount,
      });
    } catch (error) {
      console.error(
        "Failed to delete guest submission:",
        error,
      );

      response.status(500).json({
        success: false,
        message:
          "Failed to delete guest submission",
      });
    }
  });

/*
 * One logged-in algorithm
 */

algorithmRoutes
  .route("/algorithms/:id")
  .get(verifyToken, async (request, response) => {
    try {
      if (
        !ObjectId.isValid(request.params.id)
      ) {
        return response.status(400).json({
          success: false,
          message:
            "Invalid algorithm id",
        });
      }

      const db = database.getDb();

      const algorithm = await db
        .collection("algorithms")
        .findOne({
          _id: new ObjectId(
            request.params.id,
          ),
          userId: request.user.id,
        });

      if (!algorithm) {
        return response.status(404).json({
          success: false,
          message:
            "Algorithm not found",
        });
      }

      response.json(algorithm);
    } catch (error) {
      console.error(
        "Failed to retrieve algorithm:",
        error,
      );

      response.status(500).json({
        success: false,
        message:
          "Failed to retrieve algorithm",
      });
    }
  });

algorithmRoutes
  .route("/algorithms/:id")
  .put(verifyToken, async (request, response) => {
    try {
      if (
        !ObjectId.isValid(request.params.id)
      ) {
        return response.status(400).json({
          success: false,
          message:
            "Invalid algorithm id",
        });
      }

      const db = database.getDb();

      const existingAlgorithm = await db
        .collection("algorithms")
        .findOne({
          _id: new ObjectId(
            request.params.id,
          ),
          userId: request.user.id,
        });

      if (!existingAlgorithm) {
        return response.status(404).json({
          success: false,
          message:
            "Algorithm not found",
        });
      }

      if (
        existingAlgorithm.status === "public"
      ) {
        return response.status(409).json({
          success: false,
          message:
            "Public algorithms cannot be edited or made private",
        });
      }

      const algorithm =
        normalizeText(
          request.body.algorithm,
        );

      if (!algorithm) {
        return response.status(400).json({
          success: false,
          message:
            "Algorithm is required",
        });
      }

      const status =
        normalizeOwnerStatus(
          request.body.status,
        );

      const currentDate = new Date();

      const result = await db
        .collection("algorithms")
        .findOneAndUpdate(
          {
            _id: existingAlgorithm._id,
            userId: request.user.id,
            status: {
              $ne: "public",
            },
          },
          {
            $set: {
              algorithm,
              status,

              BLDLabId: null,
              reviewedDate: null,
              updatedDate: currentDate,
            },
          },
          {
            returnDocument: "after",
          },
        );

      if (!result) {
        return response.status(409).json({
          success: false,
          message:
            "The algorithm could not be updated",
        });
      }

      response.json(result);
    } catch (error) {
      console.error(
        "Failed to update algorithm:",
        error,
      );

      response.status(500).json({
        success: false,
        message:
          "Failed to update algorithm",
      });
    }
  });

algorithmRoutes
  .route("/algorithms/:id")
  .delete(
    verifyToken,
    async (request, response) => {
      try {
        if (
          !ObjectId.isValid(
            request.params.id,
          )
        ) {
          return response
            .status(400)
            .json({
              success: false,
              message:
                "Invalid algorithm id",
            });
        }

        const db = database.getDb();

        /*
         * Deleting a public personal record is allowed.
         * The approved BLDLab algorithm already exists in
         * the separate shared algorithm database.
         */
        const result = await db
          .collection("algorithms")
          .deleteOne({
            _id: new ObjectId(
              request.params.id,
            ),
            userId: request.user.id,
          });

        if (result.deletedCount === 0) {
          return response
            .status(404)
            .json({
              success: false,
              message:
                "Algorithm not found",
            });
        }

        response.json({
          success: true,
          deletedCount:
            result.deletedCount,
        });
      } catch (error) {
        console.error(
          "Failed to delete algorithm:",
          error,
        );

        response.status(500).json({
          success: false,
          message:
            "Failed to delete algorithm",
        });
      }
    },
  );

module.exports = algorithmRoutes;