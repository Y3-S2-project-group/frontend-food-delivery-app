// src/services/authService.js
import axios from "axios";

const authAPI = import.meta.env.VITE_API_AUTH_API_URL
const adminAPI = import.meta.env.VITE_API_ADMIN_API_URL

// Login
export const login = async (formData) => {
  try {
    const response = await axios.post(`${authAPI}/login`, formData);
    return response.data; // contains token and user
  } catch (error) {
    const message =
      error.response?.data?.msg || "An unexpected error occurred.";
    throw new Error(message);
  }
};

// Register
export const registerUser = async (userData) => {
  const payload = { ...userData, role: "customer" };
  const response = await axios.post(`${authAPI}/register`, payload);
  return response.data;
};

// Reset Password
export const resetPassword = async ({ email, newPassword }) => {
  const response = await axios.post(`${authAPI}/reset-password`, {
    email,
    newPassword,
  });
  return response.data;
};

// Forgot Password
export const forgotPassword = async (email) => {
  const response = await fetch(`${authAPI}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || "An error occurred");
  }
  return data;
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${authAPI}/verify-otp`, {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || "An error occurred");
  }
};

// Get Users
export const getUsers = async () => {
  const response = await axios.get(adminAPI);
  return response.data;
};

// Delete User
export const deleteUser = async (id) => {
  await axios.delete(`${adminAPI}/${id}`);
};

// Register Delivery Person
export const registerDeliveryPerson = async (formData) => {
  const response = await axios.post('http://localhost:8000/api/auth/register-delivery-person', formData);
  return response.data;
};

// Register Restaurant Manager
export const registerRestaurantManager = async (formData) => {
  const response = await axios.post('http://localhost:8000/api/auth/register-restaurant-manager', formData);
  return response.data;
};