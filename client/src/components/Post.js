import React from "react";
import { Link } from "react-router-dom";

const Post = ({ post }) => {
  return (
    <article>
      <h3>
        <Link to={`/posts/${post.slug}`}>{post.title}</Link>
      </h3>
      {post.featuredImage && <img src={post.featuredImage} alt={post.title} />}
      <p>{post.content.substring(0, 100)}...</p> {/* Display a short excerpt */}
      <p>By: {post.author.username}</p>
      <Link to={`/posts/${post.slug}`}>Read More</Link>
    </article>
  );
};

export default Post;
