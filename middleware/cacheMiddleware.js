const client = require("../utils/redisClient");

// Middleware to check for cached data
const checkCache = (key) => async (req, res, next) => {
  try {
    const data = await client.get(key);

    if (data) {
      console.log("Cache hit");
      return res.status(200).json(JSON.parse(data)); // Serve cached data
    }

    console.log("Cache miss");
    next(); // Proceed to the controller
  } catch (err) {
    console.error("Error checking cache:", err);
    next(); // Proceed even if Redis fails
  }
};

module.exports = { checkCache };
