
// ScanPayPage.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ScanLine } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentRequest } from "@/types";
import PaymentModal from "@/components/PaymentModal";
import { toast } from "sonner";

const ScanPayPage = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [scannedPayment, setScannedPayment] = useState<PaymentRequest | null>(null);

  const handleQRScanned = (data: string) => {
    try {
      console.log("QR Data:", data);
      setIsScanning(false);
      
      if (data.startsWith("upi://pay")) {
        // Handle UPI format
        const url = new URL(data);
        const params = new URLSearchParams(url.search);
  
        const upiPayment: PaymentRequest = {
          to: params.get("pn") || params.get("pa") || "UPI Merchant",
          amount: Number(params.get("am")) || 0,
          description: params.get("tn") || "UPI Payment",
        };
  
        setScannedPayment(upiPayment);
        setIsPaymentModalOpen(true);
      } else {
        try {
          // Handle JSON format
          const paymentData = JSON.parse(data);
          const paymentRequest: PaymentRequest = {
            amount: paymentData.amount || 100,
            to: paymentData.to || "Merchant",
            description: paymentData.description || "QR Code Payment",
          };
    
          setScannedPayment(paymentRequest);
          setIsPaymentModalOpen(true);
        } catch (jsonError) {
          // If not valid JSON, use it as a basic payment
          const basicPayment: PaymentRequest = {
            amount: 100,
            to: "Unknown Merchant",
            description: "QR Code Payment: " + data.substring(0, 20) + "...",
          };
          
          setScannedPayment(basicPayment);
          setIsPaymentModalOpen(true);
        }
      }
    } catch (error) {
      toast.error("Invalid QR code format");
      setIsScanning(true);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setScannedPayment(null);
    setIsScanning(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Scan & Pay</h1>
        </div>
      </header>

      {isScanning ? (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-2">
              <ScanLine className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Scan any QR code for payment</p>
          </div>
          
          <QRScanner 
            onClose={() => navigate("/")} 
            onScan={handleQRScanned} 
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-2">
              <ScanLine className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">QR Code Scanned</h2>
            <p className="text-sm text-muted-foreground">Processing payment details...</p>
          </div>
          
          <Button onClick={() => setIsScanning(true)}>
            Scan Again
          </Button>
          
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      )}

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          {scannedPayment && (
            <PaymentModal paymentDetails={scannedPayment} onClose={handleClosePaymentModal} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanPayPage;
