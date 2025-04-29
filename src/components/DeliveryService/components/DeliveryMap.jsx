import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DeliveryMap = ({ customerLocation, driverLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ customer: null, driver: null });

  console.log("DeliveryMap", driverLocation);

  useEffect(() => {
    // Initialize map when component mounts
    if (!mapInstanceRef.current && mapRef.current && customerLocation) {
      // Center map on customer location initially
      const customerLat = customerLocation[0];
      const customerLon = customerLocation[1];
      
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView([customerLat, customerLon], 13);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
      
      // Add customer marker
      const customerIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      markersRef.current.customer = L.marker([customerLat, customerLon], { icon: customerIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('Delivery Address');
    }
    
    return () => {
      // Clean up map instance when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Update customer marker if location changed
    if (customerLocation && markersRef.current.customer) {
        const customerLat = customerLocation[0];
        const customerLon = customerLocation[1];
      markersRef.current.customer.setLatLng([customerLat, customerLon]);
    }
    
    // Handle driver marker
    if (driverLocation) {
      const driverLon = driverLocation[0];
      const driverLat = driverLocation[1];
      
      if (markersRef.current.driver) {
        // Update existing driver marker
        markersRef.current.driver.setLatLng([driverLat, driverLon]);
      } else {
        // Create new driver marker
        const driverIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        markersRef.current.driver = L.marker([driverLat, driverLon], { icon: driverIcon })
            .addTo(mapInstanceRef.current);
      }
      
      // Set bounds to include both markers
      if (customerLocation) {
        const customerLat = customerLocation[0];
        const customerLon = customerLocation[1];
        
        const bounds = L.latLngBounds(
          [customerLat, customerLon],
          [driverLat, driverLon]
        );
        
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [customerLocation, driverLocation]);
  
  if (!customerLocation) {
    return (
      <div className="flex justify-center items-center h-60 bg-gray-100 rounded-md">
        <p className="text-gray-500">No location data available</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md overflow-hidden">
      <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
      <div className="bg-gray-100 p-2 text-xs flex justify-between">
        <div>
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
          Delivery Address
        </div>
        <div>
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
          Driver Location
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;