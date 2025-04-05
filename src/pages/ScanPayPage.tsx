import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PaymentModal from "@/components/PaymentModal";
import { PaymentRequest } from "@/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const ScanPayPage = () => {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [scannedPayment, setScannedPayment] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleQRScanned = (data: string) => {
    try {
      const paymentData = JSON.parse(data);

      const paymentRequest: PaymentRequest = {
        amount: paymentData.amount || 100,
        to: paymentData.to || "Merchant",
        description: paymentData.description || "QR Code Payment",
      };

      setScannedPayment(paymentRequest);

      const options = {
        key: "rzp_test_eDVMj23yL98Hvt", // Replace with your Razorpay Key
        amount: paymentRequest.amount * 100, // amount in paise
        currency: "INR",
        name: paymentRequest.to,
        description: paymentRequest.description,
        handler: function (response: any) {
          console.log("Payment success", response);
          setIsPaymentModalOpen(true);
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("QR Scan Error", error);
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
