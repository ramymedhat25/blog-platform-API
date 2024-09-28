const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

//Register a New User
router.post("/register", register);

//Login an Existing User
router.post("/login", login);

module.exports = router;
