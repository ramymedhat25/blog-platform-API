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
  const limit = 10; // Number of posts per page
  const page = req.query.page ? parseInt(req.query.page) : 1;

  try {
    const total = await BlogPost.countDocuments();
    const posts = await BlogPost.find()
      .select(
        "_id title slug content featuredImage tags author createdAt updatedAt"
      )
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("author", "username"); // Populate author field with username

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
  // Validate and sanitize input
  body("title").notEmpty().withMessage("Title is required").trim().escape(),
  body("content").notEmpty().withMessage("Content is required").trim().escape(),

  upload.single("featuredImage"), // Handle image upload

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, tags } = req.body;

      // Generate slug and ensure uniqueness
      let slug = slugify(title, { lower: true });
      let slugExists = await BlogPost.findOne({ slug });
      let counter = 1;
      while (slugExists) {
        slug = `${slug}-${counter}`;
        counter++;
        slugExists = await BlogPost.findOne({ slug });
      }

      const newPost = new BlogPost({
        title,
        slug,
        content,
        featuredImage: req.file ? req.file.url : null, // Use req.file.url for Cloudinary URL
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        author: req.user._id, // Make sure req.user is populated by your auth middleware
      });

      const savedPost = await newPost.save();

      res.status(201).json(savedPost);
    } catch (error) {
      next(error);
    }
  },
];

// @desc Get a single blog post by slug or ID
// @route GET /api/posts/:idOrSlug
// @access Public
const getPostById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    // Check if the parameter is a valid MongoDB ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    let post;

    if (isObjectId) {
      // Fetch post by ID
      post = await BlogPost.findById(idOrSlug).populate("author", "username");
    } else {
      // Fetch post by slug
      post = await BlogPost.findOne({ slug: idOrSlug }).populate(
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
// @route PUT /api/posts/:idOrSlug
// @access Private (requires authentication and authorization)
const updatePost = [
  // Validate and sanitize input (similar to createPost)
  body("title").notEmpty().withMessage("Title is required").trim().escape(),
  body("content").notEmpty().withMessage("Content is required").trim().escape(),

  upload.single("featuredImage"), // Handle image upload

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { idOrSlug } = req.params;
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

      let post;
      if (isObjectId) {
        post = await BlogPost.findById(idOrSlug);
      } else {
        post = await BlogPost.findOne({ slug: idOrSlug });
      }

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Authorization check (assuming you have req.user from auth middleware)
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { title, content, tags } = req.body;

      // Update fields, regenerate slug if title changed, and ensure uniqueness
      post.title = title || post.title;
      post.content = content || post.content;
      if (title) {
        let newSlug = slugify(title, { lower: true });
        let slugExists = await BlogPost.findOne({
          slug: newSlug,
          _id: { $ne: post._id },
        });
        let counter = 1;
        while (slugExists) {
          newSlug = `${newSlug}-${counter}`; // Corrected template literal
          counter++;
          slugExists = await BlogPost.findOne({ slug: newSlug });
        }
        post.slug = newSlug;
      }

      post.tags = tags ? tags.split(",").map((tag) => tag.trim()) : [];
      post.featuredImage = req.file ? req.file.url : post.featuredImage;

      const updatedPost = await post.save();
      res.status(200).json(updatedPost);
    } catch (error) {
      next(error);
    }
  },
];

// @desc Delete a blog post
// @route DELETE /api/posts/:idOrSlug
// @access Private (requires authentication and authorization)
const deletePost = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    let post;
    if (isObjectId) {
      post = await BlogPost.findById(idOrSlug);
    } else {
      post = await BlogPost.findOne({ slug: idOrSlug });
    }

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization check
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await BlogPost.deleteOne({ _id: post._id }); // Use deleteOne to delete the post
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
