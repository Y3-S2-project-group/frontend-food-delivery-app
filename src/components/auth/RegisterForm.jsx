// src/components/auth/RegisterForm.jsx

"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { registerDeliveryPerson, registerRestaurantManager } from "@/services/api"; // adjust if needed

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("delivery");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (activeTab === "delivery") {
        await registerDeliveryPerson(formData);
        alert("Delivery personnel registered!");
      } else if (activeTab === "restaurant") {
        await registerRestaurantManager(formData);
        alert("Restaurant manager registered!");
      }
      // Clear form after successful registration
      setFormData({ name: "", email: "", password: "" });

      navigate('/');
    } catch (err) {
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center text-orange-500 mb-6">
            Welcome to the Dishigo!
          </h1>
          <p className="text-center text-sm text-gray-700 mb-6">
            Dishigo is where you can join a vibrant community of delivery professionals and restaurant managers! Whether you're driving the future of food delivery or managing operations at a restaurant, we have the perfect role for you.
          </p>
          <Tabs defaultValue="delivery" className="w-full" onValueChange={(tab) => setActiveTab(tab)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="delivery">Delivery Personnel</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant Manager</TabsTrigger>
            </TabsList>

            <TabsContent value="delivery">
              <FormContent
                formData={formData}
                error={error}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                roleLabel="Delivery Personnel"
              />
            </TabsContent>

            <TabsContent value="restaurant">
              <FormContent
                formData={formData}
                error={error}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                roleLabel="Restaurant Manager"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function FormContent({ formData, error, handleChange, handleSubmit, roleLabel }) {
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-center text-orange-500">
        Register as {roleLabel}
      </h2>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full text-black" >
        Register
      </Button>
    </form>
  );
}
