const express = require("express");
const {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(getPosts).post(protect, createPost);

router
  .route("/:idOrSlug")
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
