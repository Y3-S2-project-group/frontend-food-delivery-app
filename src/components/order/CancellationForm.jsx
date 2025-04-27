import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash } from "lucide-react";

function CancellationForm({ onSubmit, onCancel, isSubmitting }) {
  const [cancellationReason, setCancellationReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cancellationReason);
  };

  return (
    <div className="border p-4 rounded-md space-y-3">
      <Label htmlFor="cancellationReason">Reason for Cancellation</Label>
      <Input
        id="cancellationReason"
        value={cancellationReason}
        onChange={(e) => setCancellationReason(e.target.value)}
        placeholder="Write your reason here..."
        disabled={isSubmitting}
      />
      <div className="flex gap-3 mt-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !cancellationReason.trim()}
          className="bg-red-500 hover:bg-red-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Cancelling...
            </>
          ) : (
            <>
              <Trash className="h-4 w-4 mr-2" />
              Confirm Cancel
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

export default CancellationForm;