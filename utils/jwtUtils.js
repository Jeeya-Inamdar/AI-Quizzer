const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, "secretKey", { expiresIn: "24h" });
};

module.exports = { generateToken };
