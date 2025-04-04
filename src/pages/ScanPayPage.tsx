
import { useState } from "react";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PaymentModal from "@/components/PaymentModal";
import { PaymentRequest } from "@/types";

const ScanPayPage = () => {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [scannedPayment, setScannedPayment] = useState<PaymentRequest | null>(null);

  const handleQRScanned = (data: string) => {
    try {
      // Assuming the QR code contains JSON data with payment details
      const paymentData = JSON.parse(data);
      
      // Create a payment request from the scanned data
      const paymentRequest: PaymentRequest = {
        amount: paymentData.amount || 100, // Default amount if not in QR
        to: paymentData.to || "Merchant", // Default recipient if not in QR
        description: paymentData.description || "QR Code Payment",
      };
      
      setScannedPayment(paymentRequest);
      setIsPaymentModalOpen(true);
    } catch (error) {
      // For demo purposes, show payment modal with dummy data if QR is invalid
      const dummyPayment: PaymentRequest = {
        amount: 250,
        to: "Coffee Shop",
        description: "Payment for goods/services",
      };
      
      setScannedPayment(dummyPayment);
      setIsPaymentModalOpen(true);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setScannedPayment(null);
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
      
      <QRScanner 
        onClose={() => navigate("/")} 
        onScan={handleQRScanned}
      />

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          {scannedPayment && (
            <PaymentModal
              paymentDetails={scannedPayment}
              onClose={handleClosePaymentModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanPayPage;
