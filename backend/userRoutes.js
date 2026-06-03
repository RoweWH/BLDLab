const express = require("express")
const database = require("./connect")
const ObjectId = require("mongodb").ObjectId
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config({path: "./config.env"})
let userRoutes = express.Router()
const saltRounds = Number(process.env.SALT_ROUNDS);
const verifyToken = require("./verifyToken");


//#1 - Retrieve All
userRoutes.route("/users").get(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("users").find({}).toArray()
    if (data.length >0) {
        response.json(data)
    } else {
        throw new Error("Data was not found :(")
    }
})

userRoutes.route("/users/me").get(verifyToken, async (request, response) => {
  try {
    let db = database.getDb();

    console.log("TOKEN DATA:", request.user);
    console.log("ID:", request.user.id);

    const user = await db.collection("users").findOne({
      _id: new ObjectId(request.user.id),
    });

    console.log("USER:", user);

    if (!user) {
      return response.status(404).json({
        message: "User not found",
      });
    }

    response.json({
      name: user.name,
      email: user.email,
      letterScheme: user.letterScheme,
      orientation: user.orientation,
    });
  } catch (error) {
    console.log("USERS ME ERROR:", error);

    response.status(500).json({
      message: "Server error",
    });
  }
});

//#2 - Retrieve One
userRoutes.route("/users/:id").get(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("users").findOne({_id: new ObjectId(request.params.id)})
    if (Object.keys(data).length >0) {
        response.json(data)
    } else {
        throw new Error("Data was not found :(")
    }
})

//#3 - Create one
userRoutes.route("/users").post(async (request, response) => {
    let db = database.getDb()

    const takenEmail = await db.collection("users").findOne({email: request.body.email})

    if (takenEmail) {
        response.json({message: "The email is taken"})
    } else {
        const hash = await bcrypt.hash(request.body.password, saltRounds)

        let mongoObject = {
            name: request.body.name,
            email: request.body.email,
            password: hash,
            joinDate: new Date(),
            letterScheme: {
                edges: "ABCDEFGHIJKLMNOPQRSTUVWX",
                corners: "ABCDEFGHIJKLMNOPQRSTUVWX"
            },
            orientation: ["W", "G"]
        }
        let data = await db.collection("users").insertOne(mongoObject)
        response.json(data)
    }
})

//#4 - Update one
userRoutes.route("/users/:id").put(async (request, response) => {
    let db = database.getDb()
    let mongoObject = {
        $set: {
            name: request.body.name,
            email: request.body.email,
            password: request.body.password,
            joinDate: request.body.joinDate,
            posts: request.body.posts
        }
    }
    let data = await db.collection("users").updateOne({_id: new ObjectId(request.params.id)}, mongoObject)
    response.json(data)
})

//#5 - Delete one
userRoutes.route("/users/:id").delete(async (request, response) => {
    let db = database.getDb()
    let data = await db.collection("users").deleteOne({_id: new ObjectId(request.params.id)})
    response.json(data)
})

//#6 - Login
userRoutes.route("/users/login").post(async (request, response) => {
  let db = database.getDb();

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
    user.password
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
    },
    process.env.SECRETKEY,
    { expiresIn: "1h" }
  );

  response.json({
    success: true,
    token,
  });
});

module.exports = userRoutes