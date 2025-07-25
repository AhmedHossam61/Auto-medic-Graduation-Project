import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import DoctorDashboard from "./components/dashboard/DoctorDashboard";
import PatientDashboard from "./components/dashboard/PatientDashboard";
import { useAuth } from "./components/auth/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if user doesn't have required role
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          user ? (
            // If already logged in, redirect to appropriate dashboard
            <Navigate to={`/${user.role}-dashboard`} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/doctor-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root Route - Redirect based on auth status */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role}-dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all route - Redirect to appropriate page */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate to={`/${user.role}-dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default AppRoutes;
