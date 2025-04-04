import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentModal from "./PaymentModal";
import { PaymentRequest } from "@/types";

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string) => void; // ✅ Added this
}

const QRScanner = ({ onClose, onScan }: QRScannerProps) => {
  const [scanning, setScanning] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentRequest | null>(null);

  const simulateScan = () => {
    setScanning(false);

    // Mock QR JSON string (simulate a real QR payload)
    const mockQRData = JSON.stringify({
      amount: 150,
      to: "Coffee Shop",
      description: "Payment for Coffee",
    });

    // ✅ Call the onScan callback with mock data
    onScan(mockQRData);
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    onClose();
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!showPayment ? (
          <div className="space-y-4">
            <div className="qr-scanner-container bg-black">
              <div className="qr-scanner-overlay">
                <div className="qr-scanner-box relative">
                  <div className="absolute inset-0 border-2 border-white rounded-md"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {scanning && (
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring"></div>
                        <div className="relative h-4 w-4 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">
                {scanning ? "Scanning QR Code..." : "QR Code Detected!"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {scanning
                  ? "Position QR code within the frame"
                  : "Processing payment details..."}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>

              <Button className="flex-1" onClick={simulateScan}>
                {scanning ? "Simulate Scan" : "Continue"}
              </Button>
            </div>
          </div>
        ) : (
          paymentDetails && (
            <PaymentModal paymentDetails={paymentDetails} onClose={handleClosePayment} />
          )
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;
