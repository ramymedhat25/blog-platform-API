import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../AuthContext";

const CreatePostForm = () => {
  const { user } = useContext(AuthContext); // Get the user object from context
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear any previous errors
    setSubmitting(true); // Set loading state to true

    // Basic client-side validation (you can add more complex validation here)
    if (!title || !content) {
      setErrors({
        title: title ? "" : "Title is required",
        content: content ? "" : "Content is required",
      });
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("tags", tags);
    if (featuredImage) {
      formData.append("featuredImage", featuredImage);
    }

    try {
      const res = await axios.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log(res.data);
      alert("Post created successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(
          err.response.data.errors.reduce((acc, error) => {
            acc[error.path] = error.msg;
            return acc;
          }, {})
        );
      } else {
        setError({ general: "An error occurred while creating the post." });
      }
    } finally {
      setSubmitting(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        {errors.title && <p className="error">{errors.title}</p>}
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
};

export default CreatePostForm;
