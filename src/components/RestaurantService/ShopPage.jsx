import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Star, X, Plus, Minus, AlertTriangle } from 'lucide-react';
import PlaceOrderForm from '../order/Placeorder.jsx';

const ShopPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({}); // Track selected items for order
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false); // Control order form visibility
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingMenu, setIsSearchingMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simple filter states integrated into main UI
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  
  // Available cuisines for filter
  const [availableCuisines, setAvailableCuisines] = useState([]);

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

  // Handle menu item selection for ordering
  const handleItemSelect = (item) => {
    setSelectedItems(prev => {
      const itemId = item._id;
      const currentCount = prev[itemId]?.quantity || 0;
      
      if (currentCount === 0) {
        // Add the item
        return {
          ...prev,
          [itemId]: {
            itemId: itemId,
            name: item.name,
            quantity: 1,
            price: item.price
          }
        };
      } else {
        // Remove the item if it exists
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
    });
  };

  // Update item quantity
  const updateItemQuantity = (itemId, change) => {
    setSelectedItems(prev => {
      if (!prev[itemId]) return prev;
      
      const updatedItem = { ...prev[itemId] };
      updatedItem.quantity = Math.max(0, updatedItem.quantity + change);
      
      if (updatedItem.quantity === 0) {
        // Remove the item if quantity is 0
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      
      return { ...prev, [itemId]: updatedItem };
    });
  };

  // Calculate total items selected
  const getTotalItemsCount = () => {
    return Object.values(selectedItems).reduce((sum, item) => sum + item.quantity, 0);
  };

  // Open order form
  const openOrderForm = () => {
    if (getTotalItemsCount() > 0) {
      setIsOrderFormOpen(true);
    }
  };

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSearchTerm('');
    setPriceFilter('all'); // Reset price filter when selecting new restaurant
    setSelectedItems({}); // Clear selected items when changing restaurants
  };

  // Navigate back to restaurant list
  const backToRestaurants = () => {
    setSelectedRestaurant(null);
    setMenuItems([]);
    setFilteredMenuItems([]);
    setSelectedItems({});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search bar and order button */}
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
          onClick={openOrderForm}
          className="relative flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          disabled={getTotalItemsCount() === 0}
        >
          <ShoppingCart size={20} />
          <span>Place Order</span>
          {getTotalItemsCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
              {getTotalItemsCount()}
            </span>
          )}
        </button>
      </div>

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

      {/* Conditionally render PlaceOrderForm */}
      {isOrderFormOpen ? (
        <PlaceOrderForm 
          selectedRestaurant={selectedRestaurant ? 
            { id: selectedRestaurant._id, name: selectedRestaurant.name } : null}
          selectedItems={Object.values(selectedItems)}
          onCancel={() => setIsOrderFormOpen(false)}
        />
      ) : (
        /* Page content */
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
                          
                          {/* Item selection controls */}
                          {selectedItems[item._id] ? (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateItemQuantity(item._id, -1)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                              >
                                <Minus size={16} />
                              </button>
                              <span>{selectedItems[item._id].quantity}</span>
                              <button 
                                onClick={() => updateItemQuantity(item._id, 1)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleItemSelect(item)}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
                            >
                              Add to Order
                            </button>
                          )}
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
      )}
    </div>
  );
};

export default ShopPage;