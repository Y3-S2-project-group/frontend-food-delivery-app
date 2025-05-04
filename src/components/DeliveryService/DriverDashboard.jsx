import React from "react";
import { DeliveryList } from "./DeliveryList";
import LogoutButton from "../LogoutButton";

export default function DriverDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>
      <LogoutButton />
      <DeliveryList />
    </div>
  );
}