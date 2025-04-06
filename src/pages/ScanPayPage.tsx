
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import QRScanner from "@/components/QRScanner";
import { PaymentRequest } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "@/components/PaymentModal";

const ScanPayPage = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentRequest | null>(null);

  const handleQRScan = (data: string) => {
    try {
      // Close the scanner
      setShowScanner(false);
      
      // Try to parse the QR data
      // QR data formats can vary, common UPI QR format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT
      let scannedUpiId = "";
      
      if (data.includes("upi://")) {
        // UPI QR code
        const url = new URL(data);
        const searchParams = new URLSearchParams(url.search);
        
        scannedUpiId = searchParams.get("pa") || "";
        const scannedAmount = searchParams.get("am") || "";
        const scannedName = searchParams.get("pn") || "";
        
        if (scannedUpiId) {
          setUpiId(scannedUpiId);
        }
        
        if (scannedAmount) {
          setAmount(scannedAmount);
        }
        
        if (scannedName) {
          setDescription(`Payment to ${scannedName}`);
        }
      } else {
        // Try to use as direct UPI ID
        setUpiId(data);
      }
      
      console.log("QR scan data processed:", { upiId: scannedUpiId });
    } catch (error) {
      console.error("Error parsing QR data:", error);
      // If can't parse as URL, just use as direct UPI ID
      setUpiId(data);
    }
  };

  const handleProceed = () => {
    if (!upiId || !amount) {
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      return;
    }
    
    // Create payment details
    const paymentReq: PaymentRequest = {
      to: upiId,
      amount: amountValue,
      description: description || `Payment to ${upiId}`,
    };
    
    setPaymentDetails(paymentReq);
    setShowPaymentModal(true);
  };

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Scan & Pay</h1>
      </div>

      <Card className="border-none shadow-lg mb-6">
        <CardContent className="p-6">
          {showScanner ? (
            <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowScanner(true)}
                  className="h-16 w-16 rounded-full"
                >
                  <QrCode className="h-8 w-8" />
                </Button>
              </div>
              <p className="text-center text-muted-foreground">
                Tap the button above to scan a QR code
              </p>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or enter details manually
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="upi-id" className="text-sm font-medium">
                    UPI ID / Phone Number
                  </label>
                  <Input
                    id="upi-id"
                    placeholder="e.g. name@bank or 9876543210"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="amount" className="text-sm font-medium">
                    Amount (₹)
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (Optional)
                  </label>
                  <Input
                    id="description"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleProceed}
                  disabled={!upiId || !amount}
                >
                  Proceed to Pay
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payment confirmation modal */}
      <Dialog 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Confirmation</DialogTitle>
            <DialogDescription>
              Review and confirm your payment details
            </DialogDescription>
          </DialogHeader>
          
          {paymentDetails && (
            <PaymentModal 
              paymentDetails={paymentDetails} 
              onClose={() => setShowPaymentModal(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanPayPage;
