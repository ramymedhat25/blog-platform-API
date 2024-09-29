import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PostDetails = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${slug}`);
        setPost(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]); // Re-fetch if slug changes

  if (loading) return <p>Loading post...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      {post.featuredImage && <img src={post.featuredImage} alt={post.title} />}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />{" "}
      {/* Render HTML content safely */}
      <p>By: {post.author.username}</p>
      {/* You can add a comments section here later */}
    </div>
  );
};

export default PostDetails;
