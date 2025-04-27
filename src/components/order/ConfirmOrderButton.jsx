import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

function ConfirmOrderButton({ onConfirm, isConfirming, isDisabled }) {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-4">
        To finalize your order, please click the button below to confirm.
      </p>
      <Button
        onClick={onConfirm}
        disabled={isConfirming || isDisabled}
        className="bg-orange-500 hover:bg-orange-600"
      >
        {isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Order
          </>
        )}
      </Button>
    </div>
  );
}

export default ConfirmOrderButton;