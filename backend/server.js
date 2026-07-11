const connect = require("./connect");
const express = require("express");
const cors = require("cors");

const users = require("./userRoutes");
const sheets = require("./sheetRoutes");
const algorithms = require("./algorithmRoutes");
const admin = require("./adminRoutes");

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://beta.bldlab.net",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allows requests without an Origin header, such as API testing tools
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "BLDLab Node API",
  });
});

app.use(users);
app.use(sheets);
app.use(algorithms);
app.use(admin);

async function startServer() {
  try {
    await connect.connectToServer();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();