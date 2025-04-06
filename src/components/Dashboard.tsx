
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QrCode, CreditCard, BarChart, Clock, Home, Send, Wallet, LogOut, Shield, ChevronsUpDown } from "lucide-react";
import TransactionHistory from "./TransactionHistory";
import { initializeUserData } from "@/utils/razorpayUtils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { connectMetamask, getNetworkName } from "@/utils/metamaskUtils";
import { toast } from "sonner";

const Dashboard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [networkName, setNetworkName] = useState<string>("");
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, connectWallet } = useAuth();

  useEffect(() => {
    // Initialize mock data
    initializeUserData();
    
    // Load user balance
    const userBalance = user?.balance || parseFloat(localStorage.getItem("userBalance") || "0");
    setBalance(userBalance);
    
    // Set network name if available
    if (user?.chainId) {
      try {
        const network = getNetworkName(user.chainId);
        setNetworkName(network);
      } catch (error) {
        console.error("Error getting network name:", error);
      }
    }
    
    // Listen for balance changes
    const balanceListener = () => {
      const updatedBalance = parseFloat(localStorage.getItem("userBalance") || "0");
      setBalance(updatedBalance);
    };
    
    window.addEventListener("storage", balanceListener);
    
    // Add Razorpay script
    if (!(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
      };
      
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
      };
    }
    
    // Listen for chain changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        if (user?.walletAddress) {
          const network = getNetworkName(chainId);
          setNetworkName(network);
          
          // Update user with new chain ID
          const updatedUser = {
            ...user,
            chainId
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          toast.info(`Network changed to ${network}`);
        }
      });
    }
    
    return () => {
      window.removeEventListener("storage", balanceListener);
    };
  }, [user]);

  const handleTabChange = (value: string) => {
    if (value === "history") {
      navigate("/history");
      return;
    } else if (value === "credit-score") {
      navigate("/credit-score");
      return;
    }
    setActiveTab(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-primary flex items-center">
            <Shield className="h-5 w-5 mr-2" /> TransPay
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start p-2">
                <div className="ml-2">
                  <p className="text-sm font-medium">{user?.name || "Guest User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              {user?.walletAddress ? (
                <>
                  <DropdownMenuItem className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span className="text-xs font-medium">{`${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}`}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-2" onClick={handleConnectWallet}>
                      <ChevronsUpDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                  {networkName && (
                    <DropdownMenuItem className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span className="text-xs">{networkName}</span>
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleConnectWallet(); }}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {isAuthenticated ? (
                <DropdownMenuItem onSelect={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => navigate("/login")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Login
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-r from-blue-600 to-blue-400">
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
              {user?.walletAddress ? (
                <div className="mt-2 bg-white/10 rounded-md p-2 text-xs text-white/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 mr-1 text-white/80" />
                      <span>Wallet Connected</span>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full">
                      {networkName || "Unknown Network"}
                    </span>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  className="mt-2 text-white bg-white/10 hover:bg-white/20 w-full text-xs h-8" 
                  onClick={handleConnectWallet}
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  Connect Wallet
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4">
              <div 
                onClick={() => navigate("/scan-pay")} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">Scan & Pay</span>
              </div>
              <div 
                onClick={() => navigate("/bill-pay")} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                  <CreditCard className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-xs font-medium">Bill Pay</span>
              </div>
              <div 
                onClick={() => navigate("/send-money")} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                  <Send className="h-5 w-5 text-accent" />
                </div>
                <span className="text-xs font-medium">Send</span>
              </div>
              <div 
                onClick={() => navigate("/finance")} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                  <BarChart className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">Finance</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">Recent Transactions</h2>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => navigate("/history")}>
                View All
              </Button>
            </div>
            <TransactionHistory limit={3} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
