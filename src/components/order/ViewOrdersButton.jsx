import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";

function ViewOrdersButton() {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="outline"
      onClick={() => navigate("/orders")}
      className="flex items-center"
    >
      <List className="h-4 w-4 mr-2" />
      My Orders
    </Button>
  );
}

export default ViewOrdersButton;