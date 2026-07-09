const connect = require("./connect");
const express = require("express");
const cors = require("cors");
const users = require("./userRoutes");
const sheets = require("./sheetRoutes");
const algorithms = require("./algorithmRoutes");
const admin = require("./adminRoutes");

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use(users);
app.use(sheets);
app.use(algorithms);
app.use(admin);

app.listen(port, async () => {
   await connect.connectToServer();
   console.log("Server is running on port " + port);
});