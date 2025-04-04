
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { processPayment } from "@/utils/razorpayUtils";
import { PaymentRequest } from "@/types";
import { toast } from "sonner";

const SendMoneyPage = () => {
  const navigate = useNavigate();

  const handleSendMoney = async (recipient: string, amount: number) => {
    const paymentRequest: PaymentRequest = {
      amount: amount,
      to: recipient,
      description: `Money transfer to ${recipient}`,
    };

    try {
      const result = await processPayment(paymentRequest);
      if (result) {
        toast.success(`Money sent successfully`, {
          description: `₹${amount} sent to ${recipient}.`
        });
        navigate("/");
      }
    } catch (error) {
      toast.error("Transfer failed", {
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
          <h1 className="text-xl font-bold ml-2">Send Money</h1>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Select a Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Ajay", amount: 500 },
              { name: "Priya", amount: 1000 },
              { name: "Rahul", amount: 200 },
              { name: "Neha", amount: 750 }
            ].map((contact) => (
              <Button 
                key={contact.name}
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => handleSendMoney(contact.name, contact.amount)}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">
                    {contact.name.charAt(0)}
                  </span>
                </div>
                <span className="font-semibold">{contact.name}</span>
                <span className="text-muted-foreground text-sm">₹{contact.amount}</span>
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

export default SendMoneyPage;
