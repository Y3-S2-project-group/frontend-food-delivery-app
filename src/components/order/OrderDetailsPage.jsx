import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderStatusManager from './OrderStatusManager';
import { getOrderDetails } from '@/services/orderService';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderDetails(orderId);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleStatusUpdate = (updatedOrder) => {
    setOrder(updatedOrder);
  };

  if (loading) return <div className="p-6 text-center">Loading order details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!order) return <div className="p-6 text-center">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Order #{orderId.slice(-6)}</h1>
        <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Order details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-bold">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Address:</span> {order.customerInfo.street}, {order.customerInfo.city}</p>
              <p><span className="font-medium">Contact:</span> {order.customerInfo.contactNumber}</p>
            </div>
          </div>
        </div>

        {/* Right column - Status management */}
        <div className="md:col-span-1">
          <OrderStatusManager 
            order={order} 
            onStatusUpdate={handleStatusUpdate} 
          />
          
          {order.status === 'CANCELLED' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium">Cancellation Reason</h3>
              <p className="text-red-700 mt-1">{order.cancellationReason || 'No reason provided'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;