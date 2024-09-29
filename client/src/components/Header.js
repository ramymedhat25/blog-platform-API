import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <h1>My Blog</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>
      {/* You can add a search bar here later */}
    </header>
  );
};

export default Header;
