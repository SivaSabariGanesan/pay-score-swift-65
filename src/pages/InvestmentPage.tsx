
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Info, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const InvestmentPage = () => {
  const navigate = useNavigate();
  
  const handleInvestClick = (option: string) => {
    toast.success("Investment initiated", {
      description: `Your investment in ${option} is being processed.`
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/finance")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Investment Options</h1>
        </div>
      </header>
      
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mutual Funds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="font-medium">Equity Funds</p>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">12.5% (3Y returns)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">Debt Funds</p>
                <div className="flex items-center justify-end text-blue-600">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span className="text-sm">7.5% (3Y returns)</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Start with as low as ₹500 per month through SIPs</p>
            <Button 
              className="w-full" 
              onClick={() => handleInvestClick("Mutual Funds")}
            >
              Explore Funds
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Stocks & ETFs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Direct Equity</p>
                <p className="text-sm text-muted-foreground">Trade in 5000+ stocks & ETFs</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Zero commission on equity delivery trades</p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleInvestClick("Stocks & ETFs")}
            >
              Open Trading Account
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fixed Deposits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="p-2 border rounded-md text-center">
                <p className="text-lg font-bold">5.5%</p>
                <p className="text-xs text-muted-foreground">1 Year</p>
              </div>
              <div className="p-2 border rounded-md text-center bg-blue-50">
                <p className="text-lg font-bold">6.25%</p>
                <p className="text-xs text-muted-foreground">3 Years</p>
              </div>
              <div className="p-2 border rounded-md text-center">
                <p className="text-lg font-bold">6.8%</p>
                <p className="text-xs text-muted-foreground">5 Years</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Guaranteed returns with deposit insurance up to ₹5 lakhs</p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleInvestClick("Fixed Deposits")}
            >
              Book FD Now
            </Button>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <p className="text-sm text-blue-800">Investments in securities market are subject to market risks. Past performance is not indicative of future returns.</p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPage;
