import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

function OrderItems({ items, onQuantityChange, isDisabled, isDraft }) {
  if (!items || items.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-medium">Order Items</h3>
        <div className="border rounded-md p-4 text-center text-gray-500">
          No items in this order
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Order Items</h3>
      <div className="border rounded-md overflow-hidden">
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.itemId} className="flex justify-between items-center p-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
                {isDraft ? (
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onQuantityChange(item.itemId, -1)}
                      disabled={isDisabled}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onQuantityChange(item.itemId, 1)}
                      disabled={isDisabled}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <span>Qty: {item.quantity}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 bg-gray-50">
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>
              ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      {isDraft && (
        <p className="text-xs text-orange-600 mt-1">
          * Items can be adjusted in DRAFT status
        </p>
      )}
    </div>
  );
}

export default OrderItems;