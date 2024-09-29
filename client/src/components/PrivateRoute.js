import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists in local storage

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />; // Redirect to login if not authenticated
};

export default PrivateRoute;
