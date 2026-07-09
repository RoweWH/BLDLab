const express = require("express");
const database = require("./connect");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config.env" });

const verifyToken = require("./verifyToken");

const userRoutes = express.Router();
const saltRounds = Number(process.env.SALT_ROUNDS);

const defaultSpeffzLetterScheme = {
   edges: {
      UB: "A",
      UR: "B",
      UF: "C",
      UL: "D",

      LU: "E",
      LF: "F",
      LD: "G",
      LB: "H",

      FU: "I",
      FR: "J",
      FD: "K",
      FL: "L",

      RU: "M",
      RB: "N",
      RD: "O",
      RF: "P",

      BU: "Q",
      BL: "R",
      BD: "S",
      BR: "T",

      DF: "U",
      DR: "V",
      DB: "W",
      DL: "X",
   },

   corners: {
      UBL: "A",
      UBR: "B",
      UFR: "C",
      UFL: "D",

      LUB: "E",
      LUF: "F",
      LDF: "G",
      LDB: "H",

      FUL: "I",
      FUR: "J",
      FDR: "K",
      FDL: "L",

      RUF: "M",
      RUB: "N",
      RDB: "O",
      RDF: "P",

      BUR: "Q",
      BUL: "R",
      BDL: "S",
      BDR: "T",

      DFL: "U",
      DFR: "V",
      DBR: "W",
      DBL: "X",
   },
};

function normalizeLetterScheme(letterScheme) {
   return {
      edges: {
         ...defaultSpeffzLetterScheme.edges,
         ...(letterScheme?.edges ?? {}),
      },
      corners: {
         ...defaultSpeffzLetterScheme.corners,
         ...(letterScheme?.corners ?? {}),
      },
   };
}

userRoutes.route("/users").get(async (request, response) => {
   const db = database.getDb();
   const data = await db.collection("users").find({}).toArray();
   response.json(data);
});

userRoutes.route("/users/me").get(verifyToken, async (request, response) => {
   try {
      const db = database.getDb();

      const user = await db.collection("users").findOne({
         _id: new ObjectId(request.user.id),
      });

      if (!user) {
         return response.status(404).json({
            message: "User not found",
         });
      }

      response.json({
   name: user.name,
   email: user.email,
   isAdmin: user.isAdmin ?? false,
   letterScheme: normalizeLetterScheme(user.letterScheme),
   orientation: user.orientation,
});
   } catch (error) {
      console.log("USERS ME ERROR:", error);

      response.status(500).json({
         message: "Server error",
      });
   }
});

userRoutes
   .route("/users/me/letter-scheme")
   .patch(verifyToken, async (request, response) => {
      try {
         const db = database.getDb();
         const letterScheme = normalizeLetterScheme(request.body.letterScheme);

         const result = await db.collection("users").updateOne(
            { _id: new ObjectId(request.user.id) },
            {
               $set: {
                  letterScheme,
               },
            },
         );

         response.json({
            success: true,
            modifiedCount: result.modifiedCount,
            letterScheme,
         });
      } catch (error) {
         console.log("LETTER SCHEME UPDATE ERROR:", error);

         response.status(500).json({
            success: false,
            message: "Failed to update letter scheme",
         });
      }
   });

userRoutes.route("/users").post(async (request, response) => {
   const db = database.getDb();

   const takenEmail = await db.collection("users").findOne({
      email: request.body.email,
   });

   if (takenEmail) {
      return response.json({
         success: false,
         message: "The email is taken",
      });
   }

   const hash = await bcrypt.hash(request.body.password, saltRounds);

   const mongoObject = {
      name: request.body.name,
      email: request.body.email,
      password: hash,
      joinDate: new Date(),
      letterScheme: defaultSpeffzLetterScheme,
      orientation: ["W", "G"],
   };

   const data = await db.collection("users").insertOne(mongoObject);

   response.json({
      success: true,
      insertedId: data.insertedId,
   });
});

userRoutes.route("/users/login").post(async (request, response) => {
   const db = database.getDb();

   const user = await db.collection("users").findOne({
      email: request.body.email,
   });

   if (!user) {
      return response.json({
         success: false,
         message: "User not found",
      });
   }

   const confirmation = await bcrypt.compare(
      request.body.password,
      user.password,
   );

   if (!confirmation) {
      return response.json({
         success: false,
         message: "Incorrect Password",
      });
   }

   const token = jwt.sign(
      {
         id: user._id.toString(),
         isAdmin: user.isAdmin ?? false,
      },
      process.env.SECRETKEY,
      { expiresIn: "1h" },
   );

   response.json({
      success: true,
      token,
   });
});

userRoutes.route("/users/:id").get(async (request, response) => {
   const db = database.getDb();

   const data = await db.collection("users").findOne({
      _id: new ObjectId(request.params.id),
   });

   if (!data) {
      return response.status(404).json({
         message: "User not found",
      });
   }

   response.json(data);
});

userRoutes.route("/users/:id").put(async (request, response) => {
   const db = database.getDb();

   const mongoObject = {
      $set: {
         name: request.body.name,
         email: request.body.email,
         password: request.body.password,
         joinDate: request.body.joinDate,
         posts: request.body.posts,
      },
   };

   const data = await db.collection("users").updateOne(
      { _id: new ObjectId(request.params.id) },
      mongoObject,
   );

   response.json(data);
});

userRoutes.route("/users/:id").delete(async (request, response) => {
   const db = database.getDb();

   const data = await db.collection("users").deleteOne({
      _id: new ObjectId(request.params.id),
   });

   response.json(data);
});

module.exports = userRoutes;