import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Star, X, Plus, Minus, AlertTriangle } from 'lucide-react';

const ShopPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingMenu, setIsSearchingMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simple filter states integrated into main UI
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  
  // Available cuisines for filter
  const [availableCuisines, setAvailableCuisines] = useState([]);
  
  // For restaurant selection in cart
  const [selectedCartRestaurant, setSelectedCartRestaurant] = useState(null);
  const [showRestaurantWarning, setShowRestaurantWarning] = useState(false);

  // Fixed arrays of images that work reliably for academic purposes
  const restaurantImages = [
    "https://images.pexels.com/photos/6267/menu-restaurant-vintage-table.jpg",
    "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg",
    "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg",
    "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg",
    "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg"
  ];

  const foodImages = [
    "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
    "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
    "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
    "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg",
    "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
    "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg",
    "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg"
  ];

  // Fetch approved restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8001/api/restaurants/approved');
        setRestaurants(response.data);
        setFilteredRestaurants(response.data);
        
        // Extract unique cuisines for filtering
        const cuisines = [...new Set(response.data.map(restaurant => restaurant.cuisine))].filter(Boolean);
        setAvailableCuisines(cuisines);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load restaurants');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch menu items when a restaurant is selected
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedRestaurant) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8001/api/menus/public/restaurant/${selectedRestaurant._id}`);
        setMenuItems(response.data);
        setFilteredMenuItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load menu items');
        setLoading(false);
        console.error(err);
      }
    };

    fetchMenuItems();
  }, [selectedRestaurant]);

  // Apply filters for restaurants
  useEffect(() => {
    if (!restaurants.length) return;
    
    let filtered = [...restaurants];
    
    // Apply cuisine filter
    if (cuisineFilter) {
      filtered = filtered.filter(restaurant => restaurant.cuisine === cuisineFilter);
    }
    
    // Apply search term for restaurants (if not in menu search mode)
    if (!isSearchingMenu && searchTerm) {
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRestaurants(filtered);
  }, [restaurants, cuisineFilter, searchTerm, isSearchingMenu]);

  // Apply filters for menu items
  useEffect(() => {
    if (!menuItems.length) return;
    
    let filtered = [...menuItems];
    
    // Apply price filter
    if (priceFilter === 'low') {
      filtered = filtered.filter(item => item.price < 10);
    } else if (priceFilter === 'medium') {
      filtered = filtered.filter(item => item.price >= 10 && item.price < 20);
    } else if (priceFilter === 'high') {
      filtered = filtered.filter(item => item.price >= 20);
    }
    
    // Apply search term for menu items
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMenuItems(filtered);
  }, [menuItems, priceFilter, searchTerm]);

  // Search functionality for backend search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      if (isSearchingMenu) {
        // Search for menu items
        const response = await axios.get(`http://localhost:8001/api/menus/search?term=${searchTerm}`);
        setMenuItems(response.data);
        setFilteredMenuItems(response.data);
        if (response.data.length > 0) {
          setSelectedRestaurant(null);
        }
      } else {
        // Search for restaurants
        const response = await axios.get(`http://localhost:8001/api/restaurants/search?term=${searchTerm}`);
        setRestaurants(response.data);
        setFilteredRestaurants(response.data);
        setSelectedRestaurant(null);
      }
      setLoading(false);
    } catch (err) {
      setError(`Failed to search for ${isSearchingMenu ? 'menu items' : 'restaurants'}`);
      setLoading(false);
      console.error(err);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setCuisineFilter('');
    setPriceFilter('all');
    setSearchTerm('');
  };

  // Group cart items by restaurant
  const getGroupedCartItems = () => {
    return cart.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          id: item.restaurantId,
          name: item.restaurantName,
          items: [],
          subtotal: 0
        };
      }
      acc[item.restaurantId].items.push(item);
      acc[item.restaurantId].subtotal += item.price * item.quantity;
      return acc;
    }, {});
  };

  // Add item to cart with Uber Eats-like behavior
  const addToCart = (menuItem) => {
    const restaurantInfo = selectedRestaurant ? {
      restaurantId: selectedRestaurant._id,
      restaurantName: selectedRestaurant.name
    } : {
      restaurantId: menuItem.restaurantId,
      restaurantName: menuItem.restaurantName || "Unknown Restaurant"
    };
    
    // Get unique restaurants in current cart
    const cartRestaurants = [...new Set(cart.map(item => item.restaurantId))];
    
    // If cart has items from other restaurants, show warning
    if (cartRestaurants.length > 0 && !cartRestaurants.includes(restaurantInfo.restaurantId)) {
      setShowRestaurantWarning(true);
      setSelectedCartRestaurant({
        id: restaurantInfo.restaurantId,
        name: restaurantInfo.restaurantName,
        item: menuItem
      });
      setIsCartOpen(true);
      return;
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item._id === menuItem._id);
    
    if (existingItemIndex !== -1) {
      // If item exists, update quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // If item doesn't exist, add it with quantity 1
      setCart([...cart, { 
        ...menuItem, 
        quantity: 1, 
        restaurantId: restaurantInfo.restaurantId,
        restaurantName: restaurantInfo.restaurantName 
      }]);
    }
    
    // Show the cart when adding an item
    setIsCartOpen(true);
  };

  // Switch restaurants in cart (like Uber Eats)
  const switchRestaurant = () => {
    if (!selectedCartRestaurant) return;
    
    // Clear existing cart and add the new item
    setCart([{ 
      ...selectedCartRestaurant.item, 
      quantity: 1, 
      restaurantId: selectedCartRestaurant.id,
      restaurantName: selectedCartRestaurant.name 
    }]);
    
    setShowRestaurantWarning(false);
    setSelectedCartRestaurant(null);
  };

  // Update cart item quantity
  const updateCartItemQuantity = (itemId, change) => {
    const updatedCart = cart.map(item => {
      if (item._id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);
    
    setCart(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSearchTerm('');
    setPriceFilter('all'); // Reset price filter when selecting new restaurant
  };

  // Navigate back to restaurant list
  const backToRestaurants = () => {
    setSelectedRestaurant(null);
    setMenuItems([]);
    setFilteredMenuItems([]);
  };

  // Cart Item Component
  const CartItem = ({ item }) => (
    <div className="flex items-center justify-between py-2 border-b">
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateCartItemQuantity(item._id, -1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center">{item.quantity}</span>
        <button 
          onClick={() => updateCartItemQuantity(item._id, 1)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Plus size={16} />
        </button>
        <button 
          onClick={() => removeFromCart(item._id)}
          className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded-full"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );

  // Cart Popup Component
  const CartPopup = () => {
    const groupedItems = getGroupedCartItems();
    return (
      <div className="fixed top-24 right-4 w-96 bg-white shadow-2xl rounded-lg z-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-amber-50">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Restaurant warning */}
        {showRestaurantWarning && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-500 mr-2 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium">Start a new order?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your cart already has items from {cart.length > 0 ? cart[0].restaurantName : 'another restaurant'}. 
                  Do you want to clear your cart and add items from {selectedCartRestaurant?.name}?
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={switchRestaurant} 
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                  >
                    New Order
                  </button>
                  <button 
                    onClick={() => setShowRestaurantWarning(false)} 
                    className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                  >
                    Keep Current
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-h-96 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <div>
              {/* Group items by restaurant in Uber Eats style */}
              {Object.values(groupedItems).map((restaurant) => (
                <div key={restaurant.id} className="mb-6">
                  <div className="bg-gray-50 p-3 rounded-md mb-3">
                    <h3 className="font-bold text-gray-800">{restaurant.name}</h3>
                    <div className="text-sm text-gray-500">Subtotal: ${restaurant.subtotal.toFixed(2)}</div>
                  </div>
                  <div className="space-y-1">
                    {restaurant.items.map(item => (
                      <CartItem key={item._id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between py-2">
            <span className="font-medium">Subtotal:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {cart.length > 0 && (
            <>
              <div className="flex justify-between py-2">
                <span className="font-medium">Delivery fee:</span>
                <span>$3.99</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Service fee:</span>
                <span>$1.99</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 font-bold text-lg border-t mt-2 pt-3">
            <span>Total:</span>
            <span>${cart.length > 0 ? (cartTotal + 3.99 + 1.99).toFixed(2) : (0).toFixed(2)}</span>
          </div>
          
          <button 
            className={`w-full py-3 rounded-md text-white font-medium mt-2 ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search bar and cart toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={`Search for ${isSearchingMenu ? 'menu items' : 'restaurants'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSearch}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            <Search size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Search for:</span>
          <button 
            onClick={() => setIsSearchingMenu(false)}
            className={`px-3 py-1 rounded-md text-sm ${!isSearchingMenu ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Restaurants
          </button>
          <button 
            onClick={() => setIsSearchingMenu(true)}
            className={`px-3 py-1 rounded-md text-sm ${isSearchingMenu ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Menu Items
          </button>
        </div>
        <button 
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="relative flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
        >
          <ShoppingCart size={20} />
          <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Cart popup without overlay */}
      {isCartOpen && <CartPopup />}

      {/* Simple filtering options based on context */}
      {!selectedRestaurant ? (
        // Restaurant filtering
        availableCuisines.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium">Filter by cuisine:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCuisineFilter('')}
                className={`px-3 py-1 rounded-md text-sm ${!cuisineFilter ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                All
              </button>
              {availableCuisines.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => setCuisineFilter(cuisine)}
                  className={`px-3 py-1 rounded-md text-sm ${cuisineFilter === cuisine ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        )
      ) : (
        // Menu item filtering (only show when we have menu items)
        menuItems.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium">Price range:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPriceFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setPriceFilter('low')}
                className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'low' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                $ (Under $10)
              </button>
              <button
                onClick={() => setPriceFilter('medium')}
                className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                $$ ($10-$20)
              </button>
              <button
                onClick={() => setPriceFilter('high')}
                className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'high' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                $$$ (Over $20)
              </button>
            </div>
          </div>
        )
      )}

      {/* Page content */}
      <div className="min-h-screen">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : selectedRestaurant ? (
          /* Restaurant menu view */
          <div>
            <div className="flex items-center mb-6">
              <button 
                onClick={backToRestaurants}
                className="mr-4 text-blue-500 hover:underline"
              >
                ← Back to restaurants
              </button>
              <h1 className="text-xl font-bold">{selectedRestaurant.name}</h1>
            </div>

            {filteredMenuItems.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                {menuItems.length === 0 ? "No menu items available" : "No items match your filters"}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.map((item, index) => (
                  <div key={item._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200">
                      <img 
                        src={foodImages[index % foodImages.length]} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                        <button 
                          onClick={() => addToCart(item)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Restaurant list view */
          <div>
            <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
            {filteredRestaurants.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No restaurants found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant, index) => (
                  <div 
                    key={restaurant._id} 
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleRestaurantSelect(restaurant)}
                  >
                    <div className="h-40 bg-gray-200">
                      <img 
                        src={restaurantImages[index % restaurantImages.length]} 
                        alt={restaurant.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="font-bold text-lg">{restaurant.name}</h2>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
                          {restaurant.rating || 'New'}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{restaurant.cuisine}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-black-500 font-semibold">{restaurant.address?.city}</span>
                        <button className="text-blue-500 text-m font-semibold hover:underline">View Menu</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;