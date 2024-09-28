const express = require("express");
const router = express.Router();
const {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware.js");

router
  .route("/")
  .get(getPosts)
  .post(protect, upload.single("featuredImage"), createPost); // Image upload

router
  .route("/:slug")
  .get(getPostById)
  .put(protect, upload.single("featuredImage"), updatePost)
  .delete(protect, deletePost);

module.exports = router;
