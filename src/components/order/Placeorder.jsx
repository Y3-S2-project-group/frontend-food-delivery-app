import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeOrder } from "@/services/orderService";
import { Loader2, MapPin, AlertCircle } from "lucide-react";

const sampleItems = [
  { itemId: "1", name: "Margherita Pizza", price: 12.99, image: "/api/placeholder/100/100" },
  { itemId: "2", name: "Veggie Burger", price: 9.99, image: "/api/placeholder/100/100" },
  { itemId: "3", name: "Caesar Salad", price: 7.99, image: "/api/placeholder/100/100" },
  { itemId: "4", name: "Garlic Bread", price: 4.99, image: "/api/placeholder/100/100" },
  { itemId: "5", name: "Chocolate Brownie", price: 5.99, image: "/api/placeholder/100/100" },
];

const sampleRestaurants = [
  { id: "rest1", name: "Pizzeria Italiano" },
  { id: "rest2", name: "Burger Town" },
  { id: "rest3", name: "Healthy Bites" },
];

export function PlaceOrderForm() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
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
    
    // Options object - correctly passed as third parameter
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    // Correctly call getCurrentPosition with all three parameters
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      const currentCount = prev[itemId] || 0;
      
      if (currentCount === 0) {
        // Add the item
        return { ...prev, [itemId]: 1 };
      } else {
        // Remove the item if it exists
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
    });
  };

  const handleQuantityChange = (itemId, change) => {
    setSelectedItems(prev => {
      const currentCount = prev[itemId] || 0;
      const newCount = Math.max(0, currentCount + change);
      
      if (newCount === 0) {
        // Remove the item if quantity is 0
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      
      return { ...prev, [itemId]: newCount };
    });
  };

  const handleAddressChange = (e) => {
    const { id, value } = e.target;
    setAddress(prev => ({ ...prev, [id]: value }));
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [itemId, quantity]) => {
      const item = sampleItems.find(item => item.itemId === itemId);
      return sum + (item ? item.price * quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate form
    if (!selectedRestaurant) {
      setError("Please select a restaurant");
      setIsLoading(false);
      return;
    }

    if (Object.keys(selectedItems).length === 0) {
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
      ? location
      : { coordinates: [0, 0] }; // Default if no location
    
    // Check if using location but failed to get it
    if (useCurrentLocation && locationData.coordinates[0] === 0 && locationData.coordinates[1] === 0) {
      setError("Failed to get your location. Please try again or uncheck 'Use my current location'.");
      setIsLoading(false);
      return;
    }

    // Prepare order data
    const orderItems = Object.entries(selectedItems).map(([itemId, quantity]) => {
      const item = sampleItems.find(item => item.itemId === itemId);
      return {
        itemId,
        name: item.name,
        quantity,
        price: item.price
      };
    });

    const orderData = {
      restaurantId: selectedRestaurant,
      items: orderItems,
      totalAmount: calculateTotal(),
      customerInfo: address,
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
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-orange-500 mb-6">Place Your Order</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {sampleRestaurants.map(restaurant => (
                <div key={restaurant.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`restaurant-${restaurant.id}`}
                    name="restaurant"
                    className="h-4 w-4 text-orange-500"
                    checked={selectedRestaurant === restaurant.id}
                    onChange={() => setSelectedRestaurant(restaurant.id)}
                  />
                  <Label htmlFor={`restaurant-${restaurant.id}`}>{restaurant.name}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>Select Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleItems.map(item => (
                <div key={item.itemId} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {selectedItems[item.itemId] ? (
                      <>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuantityChange(item.itemId, -1)}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span>{selectedItems[item.itemId]}</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuantityChange(item.itemId, 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleItemSelect(item.itemId)}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
              
              {/* Location Section with Enhanced UI */}
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

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(selectedItems).map(([itemId, quantity]) => {
                const item = sampleItems.find(item => item.itemId === itemId);
                if (!item) return null;
                
                return (
                  <div key={itemId} className="flex justify-between">
                    <span>{item.name} × {quantity}</span>
                    <span>${(item.price * quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              
              <div className="border-t pt-2 mt-4">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
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
            onClick={() => navigate(-1)}
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
}

export default PlaceOrderForm;