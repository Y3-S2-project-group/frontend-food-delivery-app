import React, { useState } from 'react';
import { updateOrderStatus, updatePlacedOrder } from '@/services/orderService'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';

const ReadyForDeliveryActions = ({ order }) => {
    const navigate = useNavigate();
  
    const handleDriverAssignment = () => {
      navigate(`/driver-assignment/${order.restaurantId}`, { 
        state: { order }
      });
    };
  
    return (
      <div className="bg-white rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-3">Assign Driver</h3>
        <p className="text-sm text-gray-600 mb-3">
          Your order is ready for delivery. Assign a driver to complete the delivery.
        </p>
        <button 
          onClick={handleDriverAssignment}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
        >
          Assign Driver
        </button>
      </div>
    );
  };

  export default ReadyForDeliveryActions;