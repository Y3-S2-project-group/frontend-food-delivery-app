import React from "react";
import { Button } from "@/components/ui/button";

function OrderItems({ items, onQuantityChange, isDisabled, isDraft }) {
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Order Items</h3>
        {isDraft && (
          <p className="text-sm text-orange-500">Items can be adjusted in DRAFT status</p>
        )}
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.itemId} className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center space-x-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => onQuantityChange(item.itemId, -1)}
                className="w-8 h-8 p-0"
                disabled={!isDraft || isDisabled}
              >
                -
              </Button>
              <span>{item.quantity}</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => onQuantityChange(item.itemId, 1)}
                className="w-8 h-8 p-0"
                disabled={!isDraft || isDisabled}
              >
                +
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-between font-bold pt-2">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderItems;