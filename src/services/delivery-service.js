import axios from "axios";

const API_URL = "http://localhost:5078/api";

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