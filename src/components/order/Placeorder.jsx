import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeOrder } from "@/services/orderService";
import { Loader2, MapPin, AlertCircle } from "lucide-react";

// PlaceOrderForm now accepts props from ShopPage
const PlaceOrderForm = ({ selectedRestaurant, selectedItems, onCancel }) => {
  const navigate = useNavigate();
  const [address, setAddress] = useState({ street: "", city: "", contactNumber: "" });
  const [location, setLocation] = useState({ coordinates: [0, 0] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      navigate("/login", { state: { from: "/order" } });
    }
  }, [navigate]);

  // Get user's location if they opt-in
  useEffect(() => {
    if (useCurrentLocation) {
      getLocation();
    } else {
      // Reset location data when user opts out
      setLocation({ coordinates: [0, 0] });
      setLocationError("");
    }
  }, [useCurrentLocation]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError("");
    
    // Success callback
    const successCallback = (position) => {
      setLocation({
        coordinates: [position.coords.longitude, position.coords.latitude]
      });
      setIsLocating(false);
    };
    
    // Error callback
    const errorCallback = (error) => {
      let errorMessage;
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage = "Location permission was denied. Please enable location access in your browser settings.";
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = "Location information is unavailable. Please try again later.";
          break;
        case 3: // TIMEOUT
          errorMessage = "Location request timed out. Please try again.";
          break;
        default:
          errorMessage = "An unknown error occurred while getting your location.";
      }
      setLocationError(errorMessage);
      setIsLocating(false);
    };
    
    // Options object
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  };

  const handleAddressChange = (e) => {
    const { id, value } = e.target;
    setAddress(prev => ({ ...prev, [id]: value }));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate form
    if (!selectedRestaurant) {
      setError("No restaurant selected");
      setIsLoading(false);
      return;
    }

    if (selectedItems.length === 0) {
      setError("Please select at least one item");
      setIsLoading(false);
      return;
    }

    if (!address.street || !address.city || !address.contactNumber) {
      setError("Please complete all address fields");
      setIsLoading(false);
      return;
    }
    
    // Use current location only if enabled and successfully obtained
    const locationData = useCurrentLocation && location.coordinates[0] !== 0 && location.coordinates[1] !== 0
      ? { 
          type: "Point",
          coordinates: location.coordinates 
        }
      : { 
          type: "Point", 
          coordinates: [0, 0] 
        }; // Default if no location
    
    // Check if using location but failed to get it
    if (useCurrentLocation && locationData.coordinates[0] === 0 && locationData.coordinates[1] === 0) {
      setError("Failed to get your location. Please try again or uncheck 'Use my current location'.");
      setIsLoading(false);
      return;
    }

    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Prepare order data according to OrderSchema
    const orderData = {
      customerId: user._id, // From logged in user
      restaurantId: selectedRestaurant.id,
      items: selectedItems,
      totalAmount: calculateTotal(),
      customerInfo: {
        street: address.street,
        city: address.city,
        contactNumber: address.contactNumber
      },
      customerLocation: locationData,
      status: "DRAFT" // Initial status
    };

    try {
      const response = await placeOrder(orderData);
      
      // Navigate to order confirmation page with the order ID
      navigate(`/order/confirmation/${response.data._id}`);
    } catch (err) {
      setError(err.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-500">Place Your Order</h1>
        <button 
          onClick={onCancel}
          className="text-blue-500 hover:underline"
        >
          ← Back to shopping
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRestaurant ? (
              <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                <p className="font-bold">{selectedRestaurant.name}</p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                <p className="text-yellow-700">No restaurant selected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Items */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items selected</p>
              ) : (
                selectedItems.map(item => (
                  <div key={item.itemId} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))
              )}
              
              {selectedItems.length > 0 && (
                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input 
                  id="street" 
                  placeholder="123 Main St"
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="New York"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input 
                  id="contactNumber" 
                  type="tel"
                  placeholder="123-456-7890"
                  value={address.contactNumber}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              
              {/* Location Section */}
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2 p-2 rounded-lg bg-orange-50 border border-orange-100">
                  <input
                    type="checkbox"
                    id="useCurrentLocation"
                    className="h-4 w-4 accent-orange-500"
                    checked={useCurrentLocation}
                    onChange={(e) => setUseCurrentLocation(e.target.checked)}
                  />
                  <Label htmlFor="useCurrentLocation" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-orange-500" /> 
                    Use my current location for faster delivery
                  </Label>
                </div>
                
                {useCurrentLocation && isLocating && (
                  <div className="flex items-center text-sm text-orange-600 mt-2">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting your location...
                  </div>
                )}
                
                {useCurrentLocation && locationError && (
                  <div className="mt-2 p-2 bg-red-50 text-red-800 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <p className="text-sm">{locationError}</p>
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getLocation}
                      className="mt-2 text-xs border-red-300 hover:bg-red-100"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
                
                {useCurrentLocation && location.coordinates[0] !== 0 && location.coordinates[1] !== 0 && (
                  <div className="flex items-center mt-2 p-2 bg-green-50 text-green-700 rounded-md border border-green-200">
                    <MapPin className="h-4 w-4 mr-2" />
                    <p className="text-sm">
                      Location successfully detected
                      <span className="block text-xs text-green-600">
                        {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || (useCurrentLocation && isLocating)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrderForm;