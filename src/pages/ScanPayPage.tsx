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
      const paymentData = JSON.parse(data);

      const paymentRequest: PaymentRequest = {
        amount: paymentData.amount || 100,
        to: paymentData.to || "Merchant",
        description: paymentData.description || "QR Code Payment",
      };

      setScannedPayment(paymentRequest);
      setIsPaymentModalOpen(true);
    } catch (error) {
      // fallback dummy data if QR code is not valid JSON
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

      <QRScanner onClose={() => navigate("/")} onScan={handleQRScanned} />
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
