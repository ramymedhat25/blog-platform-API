const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 20,
    select: false, // hide password in the output
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});
module.exports = mongoose.model("User", userSchema);
