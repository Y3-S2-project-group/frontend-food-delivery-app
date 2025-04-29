import React, { useState, useEffect } from "react";
import { getDriverDeliveries, updateDeliveryStatus } from "@/services/delivery-service";
import { DeliveryCard } from "./components/DeliveryCard";

export function DeliveryList() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "assigned", label: "Assigned" },
    { value: "completed", label: "Completed" }
  ];

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        throw new Error("User not found");
      }
      
      const data = await getDriverDeliveries(user.id);
      setDeliveries(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await updateDeliveryStatus(deliveryId, newStatus);
      // Update local state
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status: newStatus } 
          : delivery
      ));
      fetchDeliveries();
    } catch (err) {
      setError("Failed to update delivery status: " + err.message);
    }
  };

  const filteredDeliveries = () => {
    if (activeFilter === "all") return deliveries;
    return deliveries.filter(delivery => 
      delivery.status.toLowerCase() === activeFilter.toLowerCase()
    );
  };

  if (loading) return <div className="text-center py-8">Loading deliveries...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">My Deliveries</h2>
      
      <div className="mb-6">
        <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeFilter === option.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        {filteredDeliveries().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {activeFilter !== "all" ? activeFilter : ""} deliveries found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries().map((delivery) => (
              <DeliveryCard 
                key={delivery.id}
                delivery={delivery}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}