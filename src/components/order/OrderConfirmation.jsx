import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderStatus, confirmOrder, modifyOrder } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, AlertCircle } from "lucide-react";
import OrderItems from "./OrderItems";
import AddressSection from "./AddressSection.jsx";
import CancellationForm from "./CancellationForm";

export function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [fullOrderDetails, setFullOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [items, setItems] = useState([]);
  const [showCancelForm, setShowCancelForm] = useState(false);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await getOrderStatus(orderId);
        setOrderDetails(response.data);
        
        // For demonstration - in a real app, you'd fetch full order details
        if (response.data.items) {
          setItems(response.data.items);
        } else {
          // Fallback sample items if not provided by API
          setItems([
            { itemId: "1", name: "Margherita Pizza", quantity: 1, price: 12.99 },
            { itemId: "4", name: "Garlic Bread", quantity: 1, price: 4.99 }
          ]);
        }
        
        setFullOrderDetails({
          ...response.data,
          restaurantId: "rest1",
          restaurantName: "Pizzeria Italiano",
          items: response.data.items || items,
          customerInfo: response.data.customerInfo || {
            street: "123 Main St",
            city: "New York",
            contactNumber: "555-123-4567"
          }
        });
      } catch (err) {
        setError("Failed to load order details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId]);

  const handleConfirmOrder = async () => {
    setIsConfirming(true);
    setError("");

    try {
      await confirmOrder(orderId);
      // Refresh order status
      const response = await getOrderStatus(orderId);
      setOrderDetails(response.data);
      setFullOrderDetails(prev => ({
        ...prev,
        status: response.data.status,
        updatedAt: response.data.updatedAt
      }));
    } catch (err) {
      setError(err.message || "Failed to confirm order");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    const updatedItems = items.map(item => {
      if (item.itemId === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);

    // Update local state immediately for responsive UI
    setItems(updatedItems);

    if (orderDetails?.status === "DRAFT") {
      setIsModifying(true);
      setError("");

      try {
        // Calculate new total
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity, 
          0
        );

        const updates = {
          items: updatedItems,
          totalAmount: newTotal
        };

        await modifyOrder(orderId, updates);
        
        // Update local state
        setFullOrderDetails(prev => ({
          ...prev,
          items: updatedItems,
          totalAmount: newTotal
        }));

      } catch (err) {
        // Revert local state on error
        setItems(items);
        setError(err.message || "Failed to update items");
      } finally {
        setIsModifying(false);
      }
    }
  };

  const handleCancelOrder = async (reason) => {
    if (!reason.trim()) {
      setError("Please provide a cancellation reason.");
      return;
    }
  
    setIsModifying(true);
    setError("");
  
    try {
      await modifyOrder(orderId, { status: "CANCELLED", cancellationReason: reason });
  
      // Refresh status after cancelling
      const response = await getOrderStatus(orderId);
      setOrderDetails(response.data);
      setFullOrderDetails(prev => ({
        ...prev,
        status: response.data.status,
        cancellationReason: reason,
        updatedAt: response.data.updatedAt
      }));
  
      setShowCancelForm(false);
    } catch (err) {
      setError(err.message || "Failed to cancel order");
    } finally {
      setIsModifying(false);
    }
  };

  const handleAddressUpdate = async (updatedAddress) => {
    setIsModifying(true);
    setError("");

    try {
      // Create update payload
      const updates = {
        customerInfo: updatedAddress
      };

      await modifyOrder(orderId, updates);
      
      // Update local state
      setFullOrderDetails(prev => ({
        ...prev,
        customerInfo: updatedAddress
      }));
      
      setError("");
      return true;
    } catch (err) {
      setError(err.message || "Failed to update address");
      return false;
    } finally {
      setIsModifying(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
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
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-500">
            Order Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderDetails ? (
            <>
              <div className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(orderDetails.status)}`}>
                  {orderDetails.status}
                </div>
                <h2 className="text-xl mt-2">Thank you for your order!</h2>
                <p className="text-gray-500">Order ID: {orderId}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Order Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Status:</div>
                  <div>{orderDetails.status}</div>
                  <div>Restaurant:</div>
                  <div>{fullOrderDetails?.restaurantName || "Loading..."}</div>
                  <div>Payment Status:</div>
                  <div>{orderDetails.paymentStatus}</div>
                  <div>Created:</div>
                  <div>{new Date(orderDetails.createdAt).toLocaleString()}</div>
                  <div>Last Updated:</div>
                  <div>{new Date(orderDetails.updatedAt).toLocaleString()}</div>
                </div>
              </div>
              
              {/* Order Items Section */}
              {orderDetails.status === "DRAFT" && (
                <OrderItems 
                  items={items}
                  onQuantityChange={handleQuantityChange}
                  isDisabled={isModifying}
                  isDraft={orderDetails.status === "DRAFT"}
                />
              )}

              {/* Address Section */}
              <AddressSection 
                customerInfo={fullOrderDetails?.customerInfo}
                isDraft={orderDetails.status === "DRAFT"}
                isModifying={isModifying}
                onUpdateAddress={handleAddressUpdate}
              />
              
              {orderDetails.status === "DRAFT" && (
                <>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      To finalize your order, please click the button below to confirm.
                    </p>
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={isConfirming || isModifying}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        "Confirm Order"
                      )}
                    </Button>
                  </div>
                  
                  {showCancelForm ? (
                    <CancellationForm
                      onSubmit={handleCancelOrder}
                      onCancel={() => setShowCancelForm(false)}
                      isSubmitting={isModifying}
                    />
                  ) : (
                    <div className="text-center mt-4">
                      <Button
                        variant="destructive"
                        onClick={() => setShowCancelForm(true)}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isModifying || isConfirming}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {orderDetails.status === "CONFIRMED" && (
                <div className="bg-green-50 p-4 rounded-md text-center">
                  <p className="text-green-800">
                    Your order has been confirmed and will be processed shortly.
                  </p>
                </div>
              )}
              
              {orderDetails.status === "CANCELLED" && fullOrderDetails?.cancellationReason && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-800">
                    <strong>Cancellation reason:</strong> {fullOrderDetails.cancellationReason}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-red-600">
              {error || "Could not load order information."}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/userorders")}
            >
              My Orders
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderConfirmation;