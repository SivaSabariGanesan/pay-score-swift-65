
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentRequest } from "@/types";
import { processPayment } from "@/utils/razorpayUtils";
import { processMetaMaskPayment } from "@/utils/metamaskUtils";
import { processPolygonTransaction } from "@/utils/polygonUtils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { connectMetamask, getNetworkName } from "@/utils/metamaskUtils";
import { Shield, Wallet, Loader2 } from "lucide-react";

interface PaymentModalProps {
  paymentDetails: PaymentRequest;
  onClose: () => void;
}

const PaymentModal = ({ paymentDetails, onClose }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"razorpay" | "metamask" | "polygon" | null>(null);
  const [walletInfo, setWalletInfo] = useState<{account: string, networkName: string} | null>(null);
  const { user, connectWallet } = useAuth();
  
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
      } else if (selectedMethod === "metamask" || selectedMethod === "polygon") {
        // Connect wallet first if not connected
        if (!user?.walletAddress) {
          await connectWallet();
        }
        
        // Process payment using selected network
        if (selectedMethod === "polygon") {
          success = await processPolygonTransaction(paymentDetails);
        } else {
          success = await processMetaMaskPayment(paymentDetails);
        }
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
        description: error.message || "There was an error processing your payment",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectMethod = async (method: "razorpay" | "metamask" | "polygon") => {
    setSelectedMethod(method);
    
    if ((method === "metamask" || method === "polygon") && !walletInfo) {
      try {
        const { account, networkName } = await connectMetamask();
        setWalletInfo({ account, networkName });
      } catch (error) {
        console.error("Failed to get wallet info:", error);
        toast.error("Failed to connect wallet", { 
          description: error.message 
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Confirm Payment</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review the payment details below
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="text-center py-3">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(paymentDetails.amount)}
          </div>
        </div>
        
        <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
          <div className="flex justify-between">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium">{paymentDetails.to}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">For</span>
            <span>{paymentDetails.description}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Select Payment Method</p>
          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant={selectedMethod === "razorpay" ? "default" : "outline"}
              className="flex flex-col h-auto py-4 relative"
              onClick={() => handleSelectMethod("razorpay")}
              disabled={isProcessing}
            >
              <img 
                src="https://razorpay.com/favicon.png" 
                alt="Razorpay" 
                className="h-7 w-7 mb-1.5" 
              />
              <span className="text-xs font-medium">Razorpay</span>
            </Button>
            
            <Button 
              variant={selectedMethod === "metamask" ? "default" : "outline"}
              className="flex flex-col h-auto py-4 relative"
              onClick={() => handleSelectMethod("metamask")}
              disabled={isProcessing}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                alt="MetaMask" 
                className="h-7 w-7 mb-1.5" 
              />
              <span className="text-xs font-medium">Current Network</span>
            </Button>
            
            <Button 
              variant={selectedMethod === "polygon" ? "default" : "outline"}
              className="flex flex-col h-auto py-4 relative"
              onClick={() => handleSelectMethod("polygon")}
              disabled={isProcessing}
            >
              <img 
                src="https://cryptologos.cc/logos/polygon-matic-logo.png" 
                alt="Polygon" 
                className="h-7 w-7 mb-1.5" 
              />
              <span className="text-xs font-medium">Polygon</span>
            </Button>
          </div>
          
          {walletInfo && (selectedMethod === "metamask" || selectedMethod === "polygon") && (
            <div className="mt-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {walletInfo.account.substring(0, 6)}...{walletInfo.account.substring(38)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Network: {walletInfo.networkName}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-center text-muted-foreground">
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
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : "Pay Now"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;
