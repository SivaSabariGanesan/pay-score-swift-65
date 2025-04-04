
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QrCode, CreditCard } from "lucide-react";
import CreditScore from "./CreditScore";
import TransactionHistory from "./TransactionHistory";
import QRScanner from "./QRScanner";
import { initializeUserData } from "@/utils/razorpayUtils";

const Dashboard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

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

  const toggleScanner = () => {
    setShowScanner(!showScanner);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Close scanner when switching tabs
    if (value !== "overview") {
      setShowScanner(false);
    }
  };

  return (
    <div className="container max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">PaySwift</h1>
        <p className="text-center text-muted-foreground">Quick, Secure Payments</p>
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Transactions</TabsTrigger>
          <TabsTrigger value="credit-score">Credit Score</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">₹{balance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Updated just now
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={toggleScanner}
            >
              <QrCode className="h-8 w-8" />
              <span>{showScanner ? "Hide Scanner" : "Scan & Pay"}</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <CreditCard className="h-8 w-8" />
              <span>Bill Payments</span>
            </Button>
          </div>

          {showScanner && (
            <div className="mt-6">
              <QRScanner onClose={toggleScanner} />
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <TransactionHistory limit={3} />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="credit-score">
          <CreditScore />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
