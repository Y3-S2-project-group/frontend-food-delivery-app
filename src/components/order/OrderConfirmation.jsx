import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetails, confirmOrder, modifyOrder } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import OrderItems from "./OrderItems";
import AddressSection from "./AddressSection.jsx";
import CancellationForm from "./CancellationForm";

export function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const response = await getOrderDetails(orderId);
      if (response.success && response.data) {
        setOrderDetails(response.data);
      } else {
        setError(response.message || "Failed to load order details");
      }
    } catch (err) {
      setError("Failed to load order details");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleConfirmOrder = async () => {
    setIsConfirming(true);
    setError("");

    try {
      await confirmOrder(orderId);
      // Refresh order details
      await fetchOrderDetails();
    } catch (err) {
      setError(err.message || "Failed to confirm order");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    if (!orderDetails || orderDetails.status !== "DRAFT") return;

    // Create a copy of items for local update
    const updatedItems = orderDetails.items.map(item => {
      if (item.itemId === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);

    // Update local state immediately for responsive UI
    setOrderDetails(prev => ({
      ...prev,
      items: updatedItems
    }));

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
      
      // Refresh order data
      await fetchOrderDetails();
    } catch (err) {
      // Revert local state on error
      setError(err.message || "Failed to update items");
      await fetchOrderDetails(); // Refresh to get correct state
    } finally {
      setIsModifying(false);
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
      await fetchOrderDetails(); // Refresh order data
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
      await fetchOrderDetails(); // Refresh order data
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
                  <div>{orderDetails.restaurantName || "Not available"}</div>
                  <div>Payment Status:</div>
                  <div>{orderDetails.paymentStatus}</div>
                  <div>Created:</div>
                  <div>{new Date(orderDetails.createdAt).toLocaleString()}</div>
                  <div>Last Updated:</div>
                  <div>{new Date(orderDetails.updatedAt).toLocaleString()}</div>
                </div>
              </div>
              
              {/* Order Items Section */}
              <OrderItems 
                items={orderDetails.items || []}
                onQuantityChange={handleQuantityChange}
                isDisabled={isModifying}
                isDraft={orderDetails.status === "DRAFT"}
              />

              {/* Address Section */}
              <AddressSection 
                customerInfo={orderDetails.customerInfo || {}}
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
              
              {orderDetails.status === "CANCELLED" && orderDetails.cancellationReason && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-800">
                    <strong>Cancellation reason:</strong> {orderDetails.cancellationReason}
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