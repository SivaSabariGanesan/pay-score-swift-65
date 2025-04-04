
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QrCode, CreditCard, BarChart, Clock, Home, ArrowUp, Send } from "lucide-react";
import CreditScore from "./CreditScore";
import TransactionHistory from "./TransactionHistory";
import QRScanner from "./QRScanner";
import { initializeUserData, processPayment } from "@/utils/razorpayUtils";
import { PaymentRequest } from "@/types";
import { toast } from "sonner";

const Dashboard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showBillPay, setShowBillPay] = useState<boolean>(false);
  const [showSendMoney, setShowSendMoney] = useState<boolean>(false);
  const [showFinance, setShowFinance] = useState<boolean>(false);

  useEffect(() => {
    // Initialize mock data
    initializeUserData();
    
    // Load user balance
    const userBalance = parseFloat(localStorage.getItem("userBalance") || "0");
    setBalance(userBalance);
    
    // Listen for balance changes
    const balanceListener = () => {
      const updatedBalance = parseFloat(localStorage.getItem("userBalance") || "0");
      setBalance(updatedBalance);
    };
    
    window.addEventListener("storage", balanceListener);
    
    // Add Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      window.removeEventListener("storage", balanceListener);
      document.body.removeChild(script);
    };
  }, []);

  // Toggle scanner
  const toggleScanner = () => {
    // Close other modals first
    setShowBillPay(false);
    setShowSendMoney(false);
    setShowFinance(false);
    setShowScanner(!showScanner);
  };

  // Handle Bill Pay
  const toggleBillPay = () => {
    // Close other modals first
    setShowScanner(false);
    setShowSendMoney(false);
    setShowFinance(false);
    setShowBillPay(!showBillPay);
  };

  // Handle Send Money
  const toggleSendMoney = () => {
    // Close other modals first
    setShowScanner(false);
    setShowBillPay(false);
    setShowFinance(false);
    setShowSendMoney(!showSendMoney);
  };

  // Handle Finance
  const toggleFinance = () => {
    // Close other modals first
    setShowScanner(false);
    setShowBillPay(false);
    setShowSendMoney(false);
    setShowFinance(!showFinance);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Close all modals when switching tabs
    setShowScanner(false);
    setShowBillPay(false);
    setShowSendMoney(false);
    setShowFinance(false);
  };

  const handlePayBill = async (billType: string, amount: number) => {
    const paymentRequest: PaymentRequest = {
      amount: amount,
      to: billType,
      description: `Payment for ${billType}`,
    };

    try {
      const result = await processPayment(paymentRequest);
      if (result) {
        setShowBillPay(false);
        toast.success(`Bill payment successful`, {
          description: `${billType} bill of ₹${amount} paid successfully.`
        });
      }
    } catch (error) {
      toast.error("Payment failed", {
        description: "Please try again later"
      });
    }
  };

  const handleSendMoney = async (recipient: string, amount: number) => {
    const paymentRequest: PaymentRequest = {
      amount: amount,
      to: recipient,
      description: `Money transfer to ${recipient}`,
    };

    try {
      const result = await processPayment(paymentRequest);
      if (result) {
        setShowSendMoney(false);
        toast.success(`Money sent successfully`, {
          description: `₹${amount} sent to ${recipient}.`
        });
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-primary">PaySwift</h1>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">JS</span>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-muted/50 p-1 rounded-full">
          <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-white">
            <Home className="h-4 w-4 mr-2" />
            Home
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-white">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="credit-score" className="rounded-full data-[state=active]:bg-white">
            <BarChart className="h-4 w-4 mr-2" />
            Score
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-r from-blue-500 to-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/90 text-lg font-medium">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">₹{balance.toFixed(2)}</p>
              <p className="text-sm text-white/80 mt-1 flex items-center">
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs mr-2">
                  Updated
                </span>
                Just now
              </p>
            </CardContent>
          </Card>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4">
              <div onClick={toggleScanner} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">Scan & Pay</span>
              </div>
              <div onClick={toggleBillPay} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                  <CreditCard className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-xs font-medium">Bill Pay</span>
              </div>
              <div onClick={toggleSendMoney} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                  <Send className="h-5 w-5 text-accent" />
                </div>
                <span className="text-xs font-medium">Send</span>
              </div>
              <div onClick={toggleFinance} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                  <BarChart className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">Finance</span>
              </div>
            </div>
          </div>

          {showScanner && (
            <div className="mt-4">
              <QRScanner onClose={toggleScanner} />
            </div>
          )}

          {showBillPay && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-xl">Pay Bills</CardTitle>
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
                <Button variant="outline" className="w-full" onClick={toggleBillPay}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          {showSendMoney && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-xl">Send Money</CardTitle>
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
                <Button variant="outline" className="w-full" onClick={toggleSendMoney}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          {showFinance && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-xl">Finance Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    "Check Personal Loan Offers",
                    "Apply for Credit Card",
                    "Investment Options",
                    "Insurance Plans"
                  ].map((option) => (
                    <Button 
                      key={option}
                      variant="outline" 
                      className="h-auto py-4 flex items-center justify-start gap-2 w-full"
                      onClick={() => {
                        toast.info("Coming Soon", {
                          description: `${option} feature will be available soon!`
                        });
                        setShowFinance(false);
                      }}
                    >
                      <BarChart className="h-4 w-4" />
                      <span>{option}</span>
                    </Button>
                  ))}
                </div>
                <Button variant="outline" className="w-full" onClick={toggleFinance}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">Recent Transactions</h2>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => handleTabChange("history")}>
                View All
              </Button>
            </div>
            <TransactionHistory limit={3} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-xl font-semibold mb-4">All Transactions</h2>
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="credit-score" className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-xl font-semibold mb-4">Credit Score</h2>
          <CreditScore />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
