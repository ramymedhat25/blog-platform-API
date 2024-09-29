import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../AuthContext";

const EditPostForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [originalFeaturedImage, setOriginalFeaturedImage] = useState(null); // To keep track of the original image
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${slug}`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setTags(res.data.tags.join(", "));
        setOriginalFeaturedImage(res.data.featuredImage);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear any previous errors
    setSubmitting(true);

    // Basic client-side validation (you can add more here)
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
      // Only append if a new image is selected
      formData.append("featuredImage", featuredImage);
    }

    try {
      const res = await axios.put(`/api/posts/${slug}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log(res.data);
      alert("Post updated successfully!");
      navigate(`/posts/${slug}`); // Redirect to the updated post
    } catch (err) {
      console.error(err);
      // Handle errors (similar to CreatePostForm)
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading post...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <form onSubmit={handleSubmit}>
      {/* ... input fields for title, content, tags, and image upload (similar to CreatePostForm) ... */}
      {originalFeaturedImage && (
        <div>
          <p>Current Featured Image:</p>
          <img
            src={originalFeaturedImage}
            alt={title}
            style={{ maxWidth: "300px" }}
          />
        </div>
      )}
      <button type="submit" disabled={submitting}>
        {submitting ? "Updating..." : "Update Post"}
      </button>
    </form>
  );
};

export default EditPostForm;
