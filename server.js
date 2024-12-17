const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const mongoose = require("mongoose");
const swaggerDocument = require("./swagger.json");
const fs = require("fs");
const path = require("path");

// Ensure output directory exists
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");

app.use("/auth", authRoutes);
app.use("/quiz", quizRoutes);

// Error Handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
