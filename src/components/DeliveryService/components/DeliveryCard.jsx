import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DeliveryCard({ delivery, onStatusUpdate }) {
    console.log("DeliveryCard", delivery);
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
      case "completed":
        return "bg-green-200 text-green-800";
      case "cancelled":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <Card className="mb-4 shadow-md">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">Order #{delivery.orderId}</h3>
          <Badge className={getStatusColor(delivery.status)}>
            {delivery.status}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 pt-2">
        {delivery.status !== "completed" && (
          <Button 
            variant="success" 
            onClick={() => onStatusUpdate(delivery.id, "completed")}
          >
            Mark as Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}