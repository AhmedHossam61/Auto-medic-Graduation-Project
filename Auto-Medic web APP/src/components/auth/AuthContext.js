import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password, role) => {
    setLoading(true);
    // Simulate API call
    try {
      const response = await fetch(
        "http://localhost:3500/api/v1/users/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", (data.token));
        
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Format the data exactly as the backend expects
      const formattedData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        address: {
          street: userData.address.street,
          city: userData.address.city,
          state: userData.address.state,
          zipCode: userData.address.zipCode,
          country: userData.address.country,
        },
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.passwordConfirm,
        role: userData.role || "patient",
        createdAt: new Date().toISOString(),
      };

      // Add role-specific information
      if (userData.role === "doctor") {
        formattedData.doctorInfo = {
          specialty: userData.doctorInfo.specialty,
          hospital: userData.doctorInfo.hospital,
        };
      }

      if (userData.role === "patient") {
        formattedData.patientInfo = {
          medicalHistory: userData.patientInfo?.medicalHistory || "",
          emergencyContact: userData.patientInfo?.emergencyContact || {},
        };
      }

      console.log("Formatted signup data:", formattedData); // Debug log

      const response = await fetch(
        "http://localhost:3500/api/v1/users/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
          credentials: "include", // Add this to handle cookies if needed
        }
      );

      const data = await response.json();
      if (!response.ok) {
        const errorMessage =
          data.message || `Error ${response.status}: ${response.statusText}`;
        console.error("Signup error details:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
          sentData: formattedData,
        });
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error("Signup process failed:", {
        error: error.message,
        stack: error.stack,
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
