import axios from "axios";

const API_URL = "http://localhost:5078/api";
const AUTH_URL = "http://localhost:8000/api/users";

export const getDriverDeliveries = async (driverId) => {
  try {
    const response = await axios.get(`${API_URL}/deliveries/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch deliveries");
  }
};

export const updateDeliveryStatus = async (deliveryId, status) => {
  try {
    const response = await axios.put(`${API_URL}/deliveries/${deliveryId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update delivery status");
  }
};

export const getDeliveryForOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_URL}/deliveries/order/${orderId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch delivery details');
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching delivery details:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Fetch driver by driver ID

export const getDriverLocation = async (driverId) => {
  try {
    const response = await fetch(`${AUTH_URL}/drivers/${driverId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch driver location');
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching driver location:', error);
    return {
      success: false,
      message: error.message
    };
  }
};