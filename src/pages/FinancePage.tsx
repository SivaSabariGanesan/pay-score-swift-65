
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart } from "lucide-react";
import { toast } from "sonner";

const FinancePage = () => {
  const navigate = useNavigate();
  
  const handleFinanceOptionClick = (option: string) => {
    toast.info("Coming Soon", {
      description: `${option} feature will be available soon!`
    });
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
                onClick={() => handleFinanceOptionClick(option)}
              >
                <BarChart className="h-4 w-4" />
                <span>{option}</span>
              </Button>
            ))}
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
