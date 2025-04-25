import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Plus,
  Search,
  Menu,
  Filter,
  ChevronDown,
  Star,
  Clock,
  Users,
  Eye,
  Edit,
  Save,
  X,
} from "lucide-react";

const RestaurantList = ({ isPending }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(isPending ? "pending" : "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      latitude: "",
      longitude: "",
    },
    contactNumber: "",
    email: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      const endpoint = isPending
        ? "http://localhost:5000/api/restaurants/pending"
        : "http://localhost:5000/api/restaurants/";

      try {
        const response = await axios.get(endpoint);
        setRestaurants(response.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch restaurants.");
        console.error(err);
      } 
    };

    fetchRestaurants();
  }, [isPending]);

  // Initialize edit form when a restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      setEditForm({
        name: selectedRestaurant.name || "",
        description: selectedRestaurant.description || "",
        address: {
          street: selectedRestaurant.address?.street || "",
          city: selectedRestaurant.address?.city || "",
          latitude: selectedRestaurant.address?.latitude || "",
          longitude: selectedRestaurant.address?.longitude || "",
        },
        contactNumber: selectedRestaurant.contactNumber || "",
        email: selectedRestaurant.email || "",
      });
    }
  }, [selectedRestaurant]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await axios.delete(`http://localhost:5000/api/restaurants/${id}`);
        setRestaurants((prev) =>
          prev.filter((restaurant) => restaurant._id !== id)
        );
        setSelectedRestaurant(null);
      } catch (err) {
        console.error("Error deleting restaurant:", err);
        alert("Failed to delete restaurant.");
      }
    }
  };

  // Start editing restaurant
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Cancel editing and reset form
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to current restaurant values
    if (selectedRestaurant) {
      setEditForm({
        name: selectedRestaurant.name || "",
        description: selectedRestaurant.description || "",
        address: {
          street: selectedRestaurant.address?.street || "",
          city: selectedRestaurant.address?.city || "",
          latitude: selectedRestaurant.address?.latitude || "",
          longitude: selectedRestaurant.address?.longitude || "",
        },
        contactNumber: selectedRestaurant.contactNumber || "",
        email: selectedRestaurant.email || "",
      });
    }
  };

  // Handle input change in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.');
      setEditForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      // Handle top-level fields
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission for update
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/restaurants/${selectedRestaurant._id}`,
        editForm
      );
      
      // Update restaurants list with updated restaurant
      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant._id === selectedRestaurant._id ? response.data : restaurant
        )
      );
      
      // Update selected restaurant with new data
      setSelectedRestaurant(response.data);
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success message
      alert("Restaurant updated successfully");
    } catch (err) {
      console.error("Error updating restaurant:", err);
      alert("Failed to update restaurant: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredRestaurants = restaurants
    .filter((restaurant) => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          restaurant.name.toLowerCase().includes(searchLower) ||
          (restaurant.description &&
            restaurant.description.toLowerCase().includes(searchLower)) ||
          (restaurant.address &&
            restaurant.address.city.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter((restaurant) => {
      // Filter by tab
      if (activeTab === "all") return true;
      if (activeTab === "pending") return restaurant.status === "pending";
      if (activeTab === "approved") return restaurant.status === "approved";
      if (activeTab === "rejected") return restaurant.status === "rejected";
      return true;
    });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="text-red-500 mr-3" size={24} />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-2">
            Restaurant Management
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 pl-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full outline-none"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>

            <button
              onClick={() => navigate("/rForm")}
              className="bg-orange-400 hover:bg-orange-500 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              <span>Add Restaurant</span>
            </button>
          </div>
        </div>

        {/* Main content area with flex layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side: Filtering and Restaurant List */}
          <div className="w-full lg:w-2/3">
            {/* Tabs and filters */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row">
                <div className="flex border-b sm:border-b-0 overflow-x-auto">
                  {[
                    { label: "All Restaurants", value: "all" },
                    { label: "Pending", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Rejected", value: "rejected" },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`px-4 py-3 font-medium text-sm whitespace-nowrap flex-shrink-0 border-b-2 ${
                        activeTab === tab.value
                          ? "border-orange-600 text-orange-600"
                          : "border-transparent text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Restaurant list */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    className={`p-4 hover:bg-orange-50 cursor-pointer transition-colors ${
                      selectedRestaurant &&
                      selectedRestaurant._id === restaurant._id
                        ? "bg-orange-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {restaurant.name}
                          </h3>
                          <span
                            className={`ml-2 w-2 h-2 rounded-full ${getStatusColor(
                              restaurant.status
                            )}`}
                          ></span>
                        </div>

                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          {restaurant.address && (
                            <div className="flex items-center mr-4">
                              <MapPin size={14} className="mr-1" />
                              <span className="truncate">
                                {restaurant.address.city},{" "}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center">
                            <Phone size={14} className="mr-1" />
                            <span>{restaurant.contactNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${
                              restaurant.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : restaurant.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {restaurant.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Selected Restaurant Detail View */}
          {selectedRestaurant ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6 lg:w-1/3">
              {/* Header with actions */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {selectedRestaurant.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                      ${
                        selectedRestaurant.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedRestaurant.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                  >
                    {selectedRestaurant.status}
                  </span>
                </div>
              </div>

              {/* Restaurant details or Edit form */}
              {isEditing ? (
                // Edit Form
                <form onSubmit={handleUpdate} className="p-6 space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          name="contactNumber"
                          value={editForm.contactNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Address Information
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street
                          </label>
                          <input
                            type="text"
                            name="address.street"
                            value={editForm.address.street}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              name="address.city"
                              value={editForm.address.city}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Latitude
                            </label>
                            <input
                              type="text"
                              name="address.latitude"
                              value={editForm.address.latitude}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Longitude
                            </label>
                            <input
                              type="text"
                              name="address.longitude"
                              value={editForm.address.longitude}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="p-6 space-y-5">
                  {/* Basic info */}
                  {selectedRestaurant.description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        About
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedRestaurant.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5">
                    {/* Contact Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Phone size={16} className="text-gray-500 mr-3" />
                          <span className="text-gray-700">
                            {selectedRestaurant.contactNumber}
                          </span>
                        </div>

                        {selectedRestaurant.email && (
                          <div className="flex items-center">
                            <Mail size={16} className="text-gray-500 mr-3" />
                            <span className="text-gray-700 break-all">
                              {selectedRestaurant.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    {selectedRestaurant.address && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Location
                        </h3>
                        <div className="flex">
                          <MapPin
                            size={16}
                            className="text-gray-500 mr-3 flex-shrink-0 mt-1"
                          />
                          <div>
                            <p className="text-gray-700 mb-1">
                              {selectedRestaurant.address.street},{" "}
                              {selectedRestaurant.address.city}
                            </p>
                            <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                              <span>
                                Lat: {selectedRestaurant.address.latitude}
                              </span>
                              <span className="text-gray-400">|</span>
                              <span>
                                Long: {selectedRestaurant.address.longitude}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex gap-3">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEditClick}
                        className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-medium flex-1 flex items-center justify-center transition-colors duration-150"
                      >
                        <Edit className="mr-2" size={16} />
                        Edit Details
                      </button>

                      <button
                        onClick={() => handleDelete(selectedRestaurant._id)}
                        className="border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium flex-1 flex items-center justify-center transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center lg:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No restaurant selected
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Select a restaurant from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantList;