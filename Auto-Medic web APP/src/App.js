import React from "react";
import { AuthProvider } from "./components/auth/AuthContext";
import Dashboard from "./components/dashboard/Dashboard";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
};

export default App;
