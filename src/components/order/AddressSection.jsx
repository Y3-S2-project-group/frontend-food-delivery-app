import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, X, Check, Loader2 } from "lucide-react";

function AddressSection({ customerInfo, isDraft, isModifying, onUpdateAddress }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState({
    street: customerInfo?.street || "",
    city: customerInfo?.city || "",
    contactNumber: customerInfo?.contactNumber || ""
  });

  const handleAddressChange = (e) => {
    const { id, value } = e.target;
    setEditedAddress(prev => ({ ...prev, [id]: value }));
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditedAddress({
        street: customerInfo?.street || "",
        city: customerInfo?.city || "",
        contactNumber: customerInfo?.contactNumber || ""
      });
    }
    setIsEditing(!isEditing);
  };

  const handleUpdateAddress = async () => {
    if (!editedAddress.street || !editedAddress.city || !editedAddress.contactNumber) {
      return; // Form validation should be handled here
    }

    const success = await onUpdateAddress(editedAddress);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Delivery Address</h3>
        {isDraft && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={toggleEditMode}
            disabled={isModifying}
            className="text-orange-500 hover:text-orange-600"
          >
            {isEditing ? (
              <X className="h-4 w-4 mr-1" />
            ) : (
              <Edit className="h-4 w-4 mr-1" />
            )}
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        )}
      </div>
      
      {!isEditing ? (
        <div className="border p-3 rounded-md">
          <p>{customerInfo?.street || "No street provided"}</p>
          <p>{customerInfo?.city || "No city provided"}</p>
          <p>Contact: {customerInfo?.contactNumber || "No contact provided"}</p>
        </div>
      ) : (
        <div className="space-y-3 border p-3 rounded-md">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input 
              id="street" 
              placeholder="123 Main St"
              value={editedAddress.street}
              onChange={handleAddressChange}
              disabled={isModifying}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              placeholder="New York"
              value={editedAddress.city}
              onChange={handleAddressChange}
              disabled={isModifying}
            />
          </div>
          <div>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input 
              id="contactNumber" 
              type="tel"
              placeholder="123-456-7890"
              value={editedAddress.contactNumber}
              onChange={handleAddressChange}
              disabled={isModifying}
            />
          </div>
          <Button 
            onClick={handleUpdateAddress}
            disabled={isModifying}
            className="bg-orange-500 hover:bg-orange-600 mt-2"
          >
            {isModifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default AddressSection;