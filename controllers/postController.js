const mongoose = require("mongoose");
const BlogPost = require("../models/blogModel");
const slugify = require("slugify");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary (Make sure you have your Cloudinary credentials in your .env file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage: storage });

// @desc    Get all blog posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  const limit = 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;

  try {
    const total = await BlogPost.countDocuments();
    const posts = await BlogPost.find()
      .select('_id title slug content featuredImage tags author createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('author', 'username');

    res.status(200).json({
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalPosts: total,
      postCount: posts.length,
      posts,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

// @desc Create a new blog post
// @route POST /api/posts
// @access Private (requires authentication)
const createPost = [
  body("title").notEmpty().withMessage("Title is required").trim().escape(),
  body("content").notEmpty().withMessage("Content is required").trim().escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, tags } = req.body;
      const slug = slugify(title, { lower: true });

      const newPost = new BlogPost({
        title,
        slug,
        content,
        featuredImage: req.file ? req.file.path : null,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        author: req.user._id,
      });

      const savedPost = await newPost.save();

      res.status(201).json(savedPost);
    } catch (error) {
      next(error);
    }
  },
];
// @desc Get a single blog post by slug
// @route GET /api/posts/:slug
// @access Public
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the parameter is a valid MongoDB ObjectId
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    let post;

    if (isObjectId) {
      // Fetch post by ID
      post = await BlogPost.findById(id).populate("author", "username");
    } else {
      // Fetch post by slug
      post = await BlogPost.findOne({ slug: id }).populate(
        "author",
        "username"
      );
    }

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
// @desc Update a blog post
// @route PUT /api/posts/:slug
// @access Private (requires authentication and authorization)
const updatePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, content, tags } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.slug = slugify(post.title, { lower: true });
    post.tags = tags ? tags.split(",").map((tag) => tag.trim()) : post.tags;
    post.featuredImage = req.file ? req.file.path : post.featuredImage;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc Delete a blog post
// @route DELETE /api/posts/:slug
// @access Private (requires authentication and authorization)
const deletePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.remove();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
};
