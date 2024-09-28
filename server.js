const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const connectDB = require("./config/db");

// Load environment variables
require("dotenv").config();

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoute.js"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
