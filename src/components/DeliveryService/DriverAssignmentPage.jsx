import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import vehicleIcon from '../../assets/delivery-bike.png'; 
import { updatePlacedOrder } from '@/services/orderService';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Add this after your existing DefaultIcon definition
let DriverIcon = L.icon({
    iconUrl: vehicleIcon, 
    shadowUrl: iconShadow,
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

const DriverAssignmentPage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate(); 
  const order = location.state?.order;
  const restaurantId = order?.restaurantId;

  console.log('Full order data:', order);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant details
        const restaurantResponse = await axios.get(`http://localhost:8001/api/restaurants/${restaurantId}`);
        const restaurantData = restaurantResponse.data;

        setRestaurant(restaurantData);

        // Validate coordinates before using them
        if (!restaurantData?.location?.coordinates) {
            throw new Error('Restaurant coordinates not available');
          }
          
        const coordinates = restaurantData.location.coordinates;
        const longitude = coordinates[0]
        const latitude = coordinates[1]

        // Fetch nearest drivers
        const driversResponse = await axios.get(
          `http://localhost:8000/api/users/drivers/nearest?longitude=${longitude}&latitude=${latitude}`
        );
        
        setDrivers(driversResponse.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const handleAssignDriver = async () => {
    try {
        const payload = {
            orderId: order._id,
            restaurantId: order.restaurantId,
            customerLocation: [order.customerLocation.coordinates[0], order.customerLocation.coordinates[1]] || [],
        };
        console.log('Payload for driver assignment:', payload);

        const response = await axios.post('http://localhost:5078/api/deliveries/assign', payload);
        console.log('Delivery created:', response.data);

        // const data = await updatePlacedOrder(order._id, 'SHIPPED');

      alert(`Driver has been assigned to the order.`);
      // Navigate back to orders page
      navigate(`/orders-to-confirm/${order.restaurantId}`);
    } catch (err) {
      console.error('Error assigning driver:', err);
      alert('Failed to assign driver. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!restaurant) return <div className="text-center p-4">Restaurant not found</div>;

  const restaurantPosition = [
  restaurant.location.coordinates[1], // latitude
  restaurant.location.coordinates[0]  // longitude
];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assign Driver for Order</h1>
      
      {/* <div className="mb-4">
        <h2 className="text-xl font-semibold">{restaurant.name}</h2>
        <p>{restaurant.address}</p>
      </div> */}

      {/* Map container */}
      <div className="h-[500px] w-full mb-4">
        <MapContainer 
          center={restaurantPosition} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Restaurant marker */}
          <Marker position={restaurantPosition}>
          </Marker>
          
          {/* Driver markers */}
          {drivers.map(driver => {
        // First check if location and coordinates exist before accessing them
            return driver.location && driver.location ? (
                <Marker 
                key={driver._id || driver.id}
                position={[
                    driver.location[1], 
                    driver.location[0]
                ]}
                icon={DriverIcon}
                >
                <Popup>
                    <div>
                    <strong>Driver: {driver.name}</strong><br />
                    <button 
                        className="bg-blue-500 text-white py-1 px-2 rounded mt-2"
                        onClick={() => handleAssignDriver(driver._id)}
                    >
                        Assign Driver
                    </button>
                    </div>
                </Popup>
                </Marker>
            ) : null;
            })}
        </MapContainer>
      </div>

        {/* Single driver assignment button */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-4">
        <h3 className="text-lg font-semibold mb-4">Automatic Driver Assignment</h3>
        <p className="mb-4 text-gray-700">
            Click the button below to automatically assign the nearest available driver to this order.
        </p>
        <button 
            onClick={handleAssignDriver}
            className="bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600 w-full font-bold text-lg"
        >
            Assign Driver Now
        </button>
        </div>
    </div>
  );
};

export default DriverAssignmentPage;