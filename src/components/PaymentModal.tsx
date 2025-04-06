
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentRequest } from "@/types";
import { processPayment } from "@/utils/razorpayUtils";
import { processMetaMaskPayment } from "@/utils/metamaskUtils";
import { processPolygonTransaction } from "@/utils/polygonUtils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentModalProps {
  paymentDetails: PaymentRequest;
  onClose: () => void;
}

const PaymentModal = ({ paymentDetails, onClose }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"razorpay" | "metamask" | "polygon" | null>(null);
  const { connectPolygonWallet } = useAuth();
  
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
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    
    try {
      let success = false;

      if (selectedMethod === "razorpay") {
        // Process the payment using Razorpay
        success = await processPayment(paymentDetails);
      } else if (selectedMethod === "metamask") {
        // Process payment using MetaMask
        success = await processMetaMaskPayment(paymentDetails);
      } else if (selectedMethod === "polygon") {
        // Connect wallet first
        await connectPolygonWallet();
        // Process payment using Polygon
        success = await processPolygonTransaction(paymentDetails);
      }
      
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
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Select Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={selectedMethod === "razorpay" ? "default" : "outline"}
              className="flex flex-col h-auto py-3 relative"
              onClick={() => setSelectedMethod("razorpay")}
            >
              <img 
                src="https://razorpay.com/favicon.png" 
                alt="Razorpay" 
                className="h-6 w-6 mb-1" 
              />
              <span className="text-xs">Razorpay</span>
            </Button>
            
            <Button 
              variant={selectedMethod === "metamask" ? "default" : "outline"}
              className="flex flex-col h-auto py-3 relative"
              onClick={() => setSelectedMethod("metamask")}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                alt="MetaMask" 
                className="h-6 w-6 mb-1" 
              />
              <span className="text-xs">MetaMask</span>
            </Button>
            
            <Button 
              variant={selectedMethod === "polygon" ? "default" : "outline"}
              className="flex flex-col h-auto py-3 relative"
              onClick={() => setSelectedMethod("polygon")}
            >
              <img 
                src="https://cryptologos.cc/logos/polygon-matic-logo.png" 
                alt="Polygon" 
                className="h-6 w-6 mb-1" 
              />
              <span className="text-xs">Polygon</span>
            </Button>
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
          disabled={isProcessing || !selectedMethod}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;
