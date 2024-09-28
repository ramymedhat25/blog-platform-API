const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // Import the entire controller object

// Register a new user
router.post("/register", authController.register); // Access the register function from the controller object

// Login an existing user
router.post("/login", authController.login); // Access the login function from the controller object

module.exports = router;
