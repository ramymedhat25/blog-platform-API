const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8000;
const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/errorHandler");
// Load environment variables
require("dotenv").config();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json()); // Add this if you haven't already to handle JSON payloads
// Middleware to log requests
app.use((req, res, next) => {
  const start = Date.now();

  // Log the request when it starts
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);

  // After the response is sent, log the status code and response time
  res.on("finish", () => {
    const end = Date.now();
    const duration = end - start;
    console.log(
      `[${new Date().toLocaleString()}] ${req.method} ${req.url} ${
        res.statusCode
      } ${duration}ms`
    );
  });

  next();
});

app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use(errorHandler);

// Routes
app.use("/api/auth", require("./routes/authRoute")); // Use authRoute only once
app.use("/api/posts", require("./routes/postsRoute"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
