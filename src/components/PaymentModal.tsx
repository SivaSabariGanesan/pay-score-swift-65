
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentRequest } from "@/types";
import { processPayment } from "@/utils/razorpayUtils";
import { toast } from "sonner";

interface PaymentModalProps {
  paymentDetails: PaymentRequest;
  onClose: () => void;
}

const PaymentModal = ({ paymentDetails, onClose }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Process the payment using Razorpay
      const success = await processPayment(paymentDetails);
      
      if (success) {
        toast.success("Payment successful", {
          description: `Paid ${formatCurrency(paymentDetails.amount)} to ${paymentDetails.to}`,
        });
        onClose();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed", {
        description: "There was an error processing your payment",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Confirm Payment</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review the payment details below
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="text-center py-3">
          <div className="text-2xl font-bold">
            {formatCurrency(paymentDetails.amount)}
          </div>
        </div>
        
        <div className="space-y-2 border rounded-lg p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium">{paymentDetails.to}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">For</span>
            <span>{paymentDetails.description}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment method</span>
            <span>Razorpay</span>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-center text-muted-foreground">
        By proceeding, you agree to our terms of service
      </div>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        
        <Button 
          className="flex-1"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;
