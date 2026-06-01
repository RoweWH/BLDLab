const jwt = require("jsonwebtoken");

function verifyToken(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    request.user = decoded;
    next();
  } catch {
    return response.status(401).json({ message: "Invalid token" });
  }
}

module.exports = verifyToken;