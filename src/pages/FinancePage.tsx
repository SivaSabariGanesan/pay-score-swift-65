
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart, CreditCard, Heart, PiggyBank } from "lucide-react";

const FinancePage = () => {
  const navigate = useNavigate();
  
  const handleFinanceOptionClick = (option: string) => {
    switch(option) {
      case "Check Personal Loan Offers":
        navigate("/finance/personal-loan");
        break;
      case "Apply for Credit Card":
        navigate("/finance/credit-card");
        break;
      case "Investment Options":
        navigate("/finance/investments");
        break;
      case "Insurance Plans":
        navigate("/finance/insurance");
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Finance Options</h1>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Explore Financial Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex items-center justify-start gap-2 w-full"
              onClick={() => handleFinanceOptionClick("Check Personal Loan Offers")}
            >
              <PiggyBank className="h-5 w-5 text-primary" />
              <span>Check Personal Loan Offers</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex items-center justify-start gap-2 w-full"
              onClick={() => handleFinanceOptionClick("Apply for Credit Card")}
            >
              <CreditCard className="h-5 w-5 text-secondary" />
              <span>Apply for Credit Card</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex items-center justify-start gap-2 w-full"
              onClick={() => handleFinanceOptionClick("Investment Options")}
            >
              <BarChart className="h-5 w-5 text-green-600" />
              <span>Investment Options</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex items-center justify-start gap-2 w-full"
              onClick={() => handleFinanceOptionClick("Insurance Plans")}
            >
              <Heart className="h-5 w-5 text-red-500" />
              <span>Insurance Plans</span>
            </Button>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePage;
