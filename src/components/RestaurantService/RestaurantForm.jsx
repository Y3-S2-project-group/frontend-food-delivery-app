import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RestaurantForm = ({ onRestaurantSaved = () => {} }) => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState({
    name: '',
    description: '',
    address: { street: '', city: '', district: '', latitude: '', longitude: '' },
    contactNumber: '',
    email: '',
  });

  const [locationError, setLocationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const [field] = name.split('.').slice(1);
      setRestaurant(prevState => ({
        ...prevState,
        address: {
          ...prevState.address,
          [field]: value,
        },
      }));
    } else {
      setRestaurant({
        ...restaurant,
        [name]: value,
      });
    }
  };

  // Show toast notification
  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: '' });
    }, 5000);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    axios.post('http://localhost:5000/api/restaurants', restaurant)
      .then(response => {
        showToast('Restaurant created successfully!', 'success');
        onRestaurantSaved();
        // Reset the form after successful submission
        setRestaurant({
          name: '',
          description: '',
          address: { street: '', city: '', district: '', latitude: '', longitude: '' },
          contactNumber: '',
          email: '',
        });
      })
      .catch(error => {
        console.error('Error saving restaurant:', error);
        showToast('Failed to create restaurant. Please try again.', 'error');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Function to get live location
  const getLiveLocation = () => {
    if (navigator.geolocation) {
      showToast('Fetching your location...', 'info');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRestaurant(prevState => ({
            ...prevState,
            address: {
              ...prevState.address,
              latitude,
              longitude,
            },
          }));
          setLocationError('');
          showToast('Location fetched successfully!', 'success');
        },
        (error) => {
          setLocationError('Unable to retrieve your location. Please allow location access.');
          showToast('Location access denied. Please enable it in your browser settings.', 'error');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      showToast('Your browser does not support geolocation.', 'error');
    }
  };

  // Navigate back to restaurant list
  const handleBack = () => {
    navigate('/rList');
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
          'bg-orange-50 text-orange-800 border-l-4 border-orange-500'
        }`}>
          <div className="mr-2">
            {toast.type === 'success' ? <CheckCircle size={20} /> : 
             toast.type === 'error' ? <AlertCircle size={20} /> : 
             <AlertCircle size={20} />}
          </div>
          <p className="text-sm font-medium">{toast.message}</p>
          <button 
            onClick={() => setToast({ visible: false, message: '', type: '' })} 
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Back button */}
      <div className="max-w-2xl mx-auto mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-300"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Restaurant List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-5 border border-gray-200">
        <div className="border-b border-orange-200 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-orange-600">Create Restaurant</h2>
          <p className="text-orange-500 text-sm mt-1">Fill in the details to add a new restaurant</p>
        </div>
        
        <div className="grid grid-cols-4 gap-4 items-center">
          <label className="text-sm font-semibold text-gray-700">Restaurant Name*</label>
          <div className="col-span-3">
            <input
              type="text"
              name="name"
              value={restaurant.name}
              onChange={handleChange}
              required
              placeholder="Enter restaurant name"
              className="w-full p-3 bg-orange-50 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 items-start">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <div className="col-span-3">
            <textarea
              name="description"
              value={restaurant.description}
              onChange={handleChange}
              placeholder="Brief description of the restaurant"
              rows="3"
              className="w-full p-3 bg-orange-50 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
          <h3 className="text-md font-semibold text-orange-700 mb-3">Address Information</h3>
          
          <div className="grid grid-cols-4 gap-4 items-center mt-2">
            <label className="text-sm font-medium text-gray-700">Street</label>
            <div className="col-span-3">
              <input
                type="text"
                name="address.street"
                value={restaurant.address.street}
                onChange={handleChange}
                placeholder="Street address"
                className="w-full p-2 border border-orange-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 items-center mt-2">
            <label className="text-sm font-medium text-gray-700">City</label>
            <div className="col-span-3">
              <input
                type="text"
                name="address.city"
                value={restaurant.address.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-2 border border-orange-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 items-center mt-2">
            <label className="text-sm font-medium text-gray-700">Longitude*</label>
            <div className="col-span-3">
              <input
                type="number"
                name="address.longitude"
                value={restaurant.address.longitude}
                onChange={handleChange}
                placeholder="Restaurant longitude"
                required
                className="w-full p-2 border border-orange-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 items-center mt-2">
            <label className="text-sm font-medium text-gray-700">Latitude*</label>
            <div className="col-span-3">
              <input
                type="number"
                name="address.latitude"
                value={restaurant.address.latitude}
                onChange={handleChange}
                placeholder="Restaurant latitude"
                required
                className="w-full p-2 border border-orange-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={getLiveLocation}
              className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md flex items-center transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Get Current Location
            </button>
            {locationError && (
              <p className="text-red-500 text-sm mt-2">{locationError}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 items-center">
          <label className="text-sm font-semibold text-gray-700">Contact Number*</label>
          <div className="col-span-3">
            <input
              type="text"
              name="contactNumber"
              value={restaurant.contactNumber}
              onChange={handleChange}
              required
              placeholder="Phone number"
              className="w-full p-3 bg-orange-50 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 items-center">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <div className="col-span-3">
            <input
              type="email"
              name="email"
              value={restaurant.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full p-3 bg-orange-50 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-3 ${isSubmitting ? 'bg-orange-300' : 'bg-orange-400 hover:bg-orange-500'} text-white rounded-md transition-colors duration-300 flex items-center justify-center font-medium`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Restaurant'
          )}
        </button>
        
        <div className="text-xs text-orange-600 mt-4">
          <p>* Required fields</p>
        </div>
      </form>
    </div>
  );
};

export default RestaurantForm;