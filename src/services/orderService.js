// src/services/orderService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api'; // Default if undefined
console.log("API_URL:", API_URL); // Check API_URL value

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

export const placeOrder = async (orderData) => {
  try {
    console.log('Placing order with data:', orderData); // Log the orderData to check
    const response = await axios.post(
      `${API_URL}/orders`, 
      orderData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw new Error(error.response?.data?.message || 'Failed to place order');
  }
};

// 2. Modify an order (only if status is DRAFT)
export const modifyOrder = async (orderId, updates) => {
  try {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}`, 
      updates, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to modify order');
  }
};

// 3. Confirm an order
export const confirmOrder = async (orderId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/confirm`, 
      {}, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to confirm order');
  }
};

// 4. Update order status (after CONFIRMED)
export const updateOrderStatus = async (orderId, status, cancellationReason = null) => {
  try {
    const data = { status };
    if (status === 'CANCELLED') {
      data.cancellationReason = cancellationReason;
    }
    
    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/status`, 
      data, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

// 5. Update order in PLACED status
export const updatePlacedOrder = async (orderId, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/placed`, 
      { status }, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update placed order');
  }
};

// 6. Get order status
export const getOrderStatus = async (orderId) => {
  try {
    const response = await axios.get(
      `${API_URL}/orders/${orderId}/status`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get order status');
  }
};

// 7. Get orders ready for delivery
export const getOrdersReadyForDelivery = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/orders/ready-for-delivery`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get orders ready for delivery');
  }
};