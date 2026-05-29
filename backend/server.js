const connect = require('./connect');
const express = require('express');
const cors = require('cors');
const users = require("./userRoutes")

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(users);

app.listen(port, async () => {
   await connect.connectToServer();
   console.log("Server is running on port " + port);
 });