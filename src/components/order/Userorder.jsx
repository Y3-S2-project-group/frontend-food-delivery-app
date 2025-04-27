import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Trash, AlertCircle } from "lucide-react";
import { getUserOrders, deleteOrder } from "@/services/orderService";

function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }
    
    fetchOrders();
  }, [navigate]);
  
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await getUserOrders();
      setOrders(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load your orders. Please try again later.");
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteOrder = async (orderId) => {
    try {
      setDeletingOrderId(orderId);
      await deleteOrder(orderId);
      // Remove the deleted order from the state
      setOrders(orders.filter(order => order._id !== orderId));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete order");
    } finally {
      setDeletingOrderId(null);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PLACED":
        return "bg-orange-100 text-orange-800";
      case "PREPARING":
        return "bg-yellow-100 text-yellow-800";
      case "READY_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-orange-500">My Orders</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start mb-4">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)} // Navigate back to the previous page
            className="mb-4"
          >
            Back
          </Button>
          
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">You don't have any orders yet.</p>
              <Button 
                onClick={() => navigate("/")}
                className="mt-4 bg-orange-500 hover:bg-orange-600"
              >
                Browse Restaurants
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="border rounded-md p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="ml-2 text-gray-500 text-sm">
                          Order ID: {order._id}
                        </span>
                      </div>
                      <p className="mt-2">
                        <span className="font-medium">Total:</span> ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed on: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/order/confirmation/${order._id}`)}
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {order.status === "DRAFT" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={deletingOrderId === order._id}
                          className="flex items-center"
                        >
                          {deletingOrderId === order._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Basic items summary */}
                  <div className="mt-3 text-sm text-gray-600">
                    <p>{order.items.length} item(s)</p>
                    <div className="mt-1 line-clamp-1">
                      {order.items.map((item, index) => (
                        <span key={item.itemId}>
                          {index > 0 ? ", " : ""}
                          {item.name || `Item #${item.itemId}`} (x{item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserOrders;