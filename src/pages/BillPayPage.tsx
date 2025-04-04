
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { processPayment } from "@/utils/razorpayUtils";
import { PaymentRequest } from "@/types";
import { toast } from "sonner";

const BillPayPage = () => {
  const navigate = useNavigate();

  const handlePayBill = async (billType: string, amount: number) => {
    const paymentRequest: PaymentRequest = {
      amount: amount,
      to: billType,
      description: `Payment for ${billType}`,
    };

    try {
      const result = await processPayment(paymentRequest);
      if (result) {
        toast.success(`Bill payment successful`, {
          description: `${billType} bill of ₹${amount} paid successfully.`
        });
        navigate("/");
      }
    } catch (error) {
      toast.error("Payment failed", {
        description: "Please try again later"
      });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Pay Bills</h1>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Select a Bill to Pay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Electricity", amount: 1200 },
              { name: "Water", amount: 500 },
              { name: "Internet", amount: 999 },
              { name: "Mobile", amount: 349 }
            ].map((bill) => (
              <Button 
                key={bill.name}
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => handlePayBill(bill.name, bill.amount)}
              >
                <span className="font-semibold">{bill.name}</span>
                <span className="text-muted-foreground text-sm">₹{bill.amount}</span>
              </Button>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillPayPage;
