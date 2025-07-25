import React from "react";
import { useAuth } from "../auth/AuthContext";
import LoginPage from "../auth/LoginPage";
import Header from "../shared/Header";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === "patient" ? <PatientDashboard /> : <DoctorDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
