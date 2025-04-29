import React from "react";
import { DeliveryList } from "./DeliveryList";

export default function DriverDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>
      <DeliveryList />
    </div>
  );
}