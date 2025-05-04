// src/services/orderService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'; // Default if undefined
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



// 2. Get complete order details - new implementation
export const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(
      `${API_URL}/orders/${orderId}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch order details');
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
}

  // 8. Get user orders - new implementation
export const getUserOrders = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/orders/user`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch your orders');
  }
};

// 9. Delete order - new implementation
export const deleteOrder = async (orderId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/orders/${orderId}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(error.response.data?.message || `Failed to delete order: ${error.response.status}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
};