const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const connectDB = require("./config/db");

// Load environment variables
require("dotenv").config();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json()); // Add this if you haven't already to handle JSON payloads

// Routes
app.use("/api/auth", require("./routes/authRoute")); // Use authRoute only once
app.use("/api/posts", require("./routes/postsRoute"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
