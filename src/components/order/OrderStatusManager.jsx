import React, { useState } from 'react';
import { updateOrderStatus, updatePlacedOrder } from '@/services/orderService'; // Adjust the import path as necessary

// Component for updating orders from CONFIRMED status
const ConfirmedOrderActions = ({ order, onStatusUpdate }) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateStatus = async (status) => {
    setIsLoading(true);
    setError('');
    
    try {
      let data;
      if (status === 'CANCELLED') {
        if (!cancellationReason.trim()) {
          setError('Please provide a cancellation reason');
          setIsLoading(false);
          return;
        }
        data = await updateOrderStatus(order._id, status, cancellationReason);
      } else {
        data = await updateOrderStatus(order._id, status);
      }
      
      onStatusUpdate(data.data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-3">Update Order Status</h3>
      
      <div className="flex flex-col gap-3">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        <button 
          onClick={() => handleUpdateStatus('PLACED')}
          disabled={isLoading}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Accept Order (Set to PLACED)'}
        </button>
        
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cancellation Reason
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm"
            rows="2"
            placeholder="Required if cancelling the order"
          />
          
          <button 
            onClick={() => handleUpdateStatus('CANCELLED')}
            disabled={isLoading}
            className="mt-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for updating orders in PLACED or PREPARING status
const PlacedOrderActions = ({ order, onStatusUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getNextStatus = () => {
    if (order.status === 'PLACED') return 'PREPARING';
    if (order.status === 'PREPARING') return 'READY_FOR_DELIVERY';
    return null;
  };

  const getButtonText = () => {
    if (order.status === 'PLACED') return 'Start Preparing';
    if (order.status === 'PREPARING') return 'Mark Ready for Delivery';
    return 'Update Status';
  };

  const handleUpdateStatus = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await updatePlacedOrder(order._id, nextStatus);
      onStatusUpdate(data.data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      setIsLoading(false);
    }
  };

  if (!getNextStatus()) return null;

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-3">Order Preparation</h3>
      
      {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
      
      <button 
        onClick={handleUpdateStatus}
        disabled={isLoading}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 w-full"
      >
        {isLoading ? 'Processing...' : getButtonText()}
      </button>
    </div>
  );
};

// Main component that determines which actions to show based on order status
const OrderStatusManager = ({ order, onStatusUpdate }) => {
  if (!order) return null;

  return (
    <div className="space-y-4">
      {order.status === 'CONFIRMED' && (
        <ConfirmedOrderActions 
          order={order} 
          onStatusUpdate={onStatusUpdate} 
        />
      )}
      
      {(order.status === 'PLACED' || order.status === 'PREPARING') && (
        <PlacedOrderActions 
          order={order} 
          onStatusUpdate={onStatusUpdate} 
        />
      )}
      
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="text-md font-medium mb-2">Current Status</h3>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${
            order.status === 'CONFIRMED' ? 'bg-yellow-500' :
            order.status === 'PLACED' ? 'bg-blue-500' :
            order.status === 'PREPARING' ? 'bg-orange-500' :
            order.status === 'READY_FOR_DELIVERY' ? 'bg-green-500' :
            order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-500'
          }`}></div>
          <span className="font-medium">{order.status}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusManager;