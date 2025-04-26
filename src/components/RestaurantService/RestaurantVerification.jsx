import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Eye,
  ChevronRight,
  ChevronLeft,
  Clock,
} from "lucide-react";

const RestaurantVerification = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8001/api/restaurants/pending");
      setPendingRestaurants(response.data);
      setError("");
      
      // Select the first restaurant by default if available
      if (response.data.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(response.data[0]);
      }
    } catch (err) {
      setError("Failed to fetch pending restaurant requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (id, status) => {
    try {
      setProcessingId(id);
      await axios.patch(`http://localhost:8001/api/restaurants/${id}/verify`, { status });
      
      // Remove the restaurant from the pending list
      setPendingRestaurants((prevRestaurants) => 
        prevRestaurants.filter((restaurant) => restaurant._id !== id)
      );
      
      // If the current selected restaurant was verified, select another one
      if (selectedRestaurant && selectedRestaurant._id === id) {
        const remainingRestaurants = pendingRestaurants.filter(r => r._id !== id);
        setSelectedRestaurant(remainingRestaurants.length > 0 ? remainingRestaurants[0] : null);
      }
      
      alert(`Restaurant ${status} successfully`);
    } catch (err) {
      console.error(`Error ${status} restaurant:`, err);
      alert(`Failed to ${status} restaurant: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Verification Requests</h1>
          <p className="mt-2 text-gray-600">
            Review and verify restaurant registration requests
          </p>
        </div>

        {pendingRestaurants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No pending restaurant requests
            </h3>
            <p className="text-gray-500">
              All restaurant verification requests have been processed. Check back later for new requests.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: List of pending restaurants */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-orange-50 border-b border-orange-100">
                  <h2 className="text-lg font-medium text-orange-900 flex items-center">
                    <Clock className="mr-2" size={18} />
                    Pending Requests ({pendingRestaurants.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {pendingRestaurants.map((restaurant) => (
                    <div
                      key={restaurant._id}
                      onClick={() => setSelectedRestaurant(restaurant)}
                      className={`p-4 hover:bg-orange-50 cursor-pointer transition-colors ${
                        selectedRestaurant && selectedRestaurant._id === restaurant._id
                          ? "bg-orange-50 border-l-4 border-orange-500"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {restaurant.name}
                          </h3>
                          {restaurant.address && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {restaurant.address.city || "No location"}
                            </p>
                          )}
                          {restaurant.createdAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              Submitted: {formatDate(restaurant.createdAt)}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className={`text-gray-400 ${
                            selectedRestaurant && selectedRestaurant._id === restaurant._id
                              ? "text-orange-500"
                              : ""
                          }`}
                          size={20}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Selected Restaurant Detail View */}
            {selectedRestaurant ? (
              <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-orange-50 border-b border-orange-100">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedRestaurant.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Verification request ID: {selectedRestaurant._id}
                  </p>
                </div>

                {/* Restaurant details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Basic Information
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {selectedRestaurant.description && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                Description
                              </h4>
                              <p className="text-gray-700 text-sm">
                                {selectedRestaurant.description}
                              </p>
                            </div>
                          )}

                          {/* Owner Info */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Owner ID
                            </h4>
                            <p className="text-gray-700 text-sm">
                              {selectedRestaurant.ownerId}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Contact Information
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Phone className="text-orange-500 mr-3" size={16} />
                              <span>{selectedRestaurant.contactNumber}</span>
                            </div>
                            {selectedRestaurant.email && (
                              <div className="flex items-center">
                                <Mail className="text-orange-500 mr-3" size={16} />
                                <span>{selectedRestaurant.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                      {/* Location */}
                      {selectedRestaurant.address && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">
                            Location
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-3">
                              {selectedRestaurant.address.street && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">
                                    Street
                                  </h4>
                                  <p className="text-gray-700">
                                    {selectedRestaurant.address.street}
                                  </p>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">
                                    City
                                  </h4>
                                  <p className="text-gray-700">
                                    {selectedRestaurant.address.city || "N/A"}
                                  </p>
                                </div>
                              </div>
                              {(selectedRestaurant.address.latitude || selectedRestaurant.address.longitude) && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700">
                                      Latitude
                                    </h4>
                                    <p className="text-gray-700">
                                      {selectedRestaurant.address.latitude || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700">
                                      Longitude
                                    </h4>
                                    <p className="text-gray-700">
                                      {selectedRestaurant.address.longitude || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Request Timeline
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            {selectedRestaurant.createdAt && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700">
                                  Submitted On
                                </h4>
                                <p className="text-gray-700">
                                  {formatDate(selectedRestaurant.createdAt)}
                                </p>
                              </div>
                            )}
                            {selectedRestaurant.updatedAt && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700">
                                  Last Updated
                                </h4>
                                <p className="text-gray-700">
                                  {formatDate(selectedRestaurant.updatedAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => handleVerification(selectedRestaurant._id, "rejected")}
                      disabled={processingId === selectedRestaurant._id}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 font-medium flex items-center justify-center"
                    >
                      <XCircle className="mr-2" size={16} />
                      Reject Restaurant
                    </button>
                    <button
                      onClick={() => handleVerification(selectedRestaurant._id, "approved")}
                      disabled={processingId === selectedRestaurant._id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center justify-center"
                    >
                      <CheckCircle className="mr-2" size={16} />
                      Approve Restaurant
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No restaurant selected
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Select a restaurant from the list to review its details
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantVerification;