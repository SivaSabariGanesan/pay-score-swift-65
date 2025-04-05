// ScanPayPage.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      if (data.startsWith("upi://pay")) {
        // Handle UPI format
        const url = new URL(data);
        const params = new URLSearchParams(url.search);
  
        const upiPayment: PaymentRequest = {
          to: params.get("pn") || params.get("pa") || "UPI Merchant",
          amount: Number(params.get("am")) || 0,
          description: "UPI Payment",
        };
  
        setScannedPayment(upiPayment);
        setIsPaymentModalOpen(true);
      } else {
        // Handle JSON format
        const paymentData = JSON.parse(data);
        const paymentRequest: PaymentRequest = {
          amount: paymentData.amount || 100,
          to: paymentData.to || "Merchant",
          description: paymentData.description || "QR Code Payment",
        };
  
        setScannedPayment(paymentRequest);
        setIsPaymentModalOpen(true);
      }
    } catch (error) {
      alert("Invalid QR code format.");
    }
  };
  

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setScannedPayment(null);
  };

  const triggerPayment = () => {
    if (!scannedPayment) return;

    const options = {
      key: "rzp_test_eDVMj23yL98Hvt", // 🔁 Replace with your Razorpay key
      amount: scannedPayment.amount * 100,
      currency: "INR",
      name: scannedPayment.to,
      description: scannedPayment.description,
      handler: (response: any) => {
        console.log("Payment Success:", response);
        alert("Payment Successful!");
        handleClosePaymentModal();
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
      },
      theme: {
        color: "#6366f1",
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert("Razorpay SDK not loaded");
    }
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
        <DialogContent className="sm:max-w-md space-y-4">
          {scannedPayment && (
            <>
              <div>
                <h2 className="text-lg font-semibold">{scannedPayment.to}</h2>
                <p className="text-sm text-muted-foreground">
                  {scannedPayment.description}
                </p>
                <p className="text-xl font-bold mt-2">
                  ₹{scannedPayment.amount}
                </p>
              </div>

              <Button className="w-full" onClick={triggerPayment}>
                Pay ₹{scannedPayment.amount}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanPayPage;
