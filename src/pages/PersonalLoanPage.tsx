
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, DollarSign, Info } from "lucide-react";
import { toast } from "sonner";

const PersonalLoanPage = () => {
  const navigate = useNavigate();
  
  const handleApplyClick = (loanAmount: string, interestRate: string) => {
    toast.success("Loan application initiated", {
      description: `Your application for ₹${loanAmount} at ${interestRate}% interest rate is being processed.`
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/finance")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Personal Loan Offers</h1>
        </div>
      </header>
      
      <div className="space-y-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Pre-approved Offer</span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="space-y-1">
                <p className="text-2xl font-bold">₹2,00,000</p>
                <p className="text-sm text-muted-foreground">Up to 36 months</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-500">10.5%</p>
                <p className="text-sm text-muted-foreground">Interest p.a.</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => handleApplyClick("2,00,000", "10.5")}
            >
              Apply Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Instant Personal Loan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="space-y-1">
                <p className="text-2xl font-bold">₹5,00,000</p>
                <p className="text-sm text-muted-foreground">Up to 60 months</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">12.25%</p>
                <p className="text-sm text-muted-foreground">Interest p.a.</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleApplyClick("5,00,000", "12.25")}
            >
              Check Eligibility
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Education Loan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="space-y-1">
                <p className="text-2xl font-bold">₹10,00,000</p>
                <p className="text-sm text-muted-foreground">Up to 84 months</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">8.5%</p>
                <p className="text-sm text-muted-foreground">Interest p.a.</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleApplyClick("10,00,000", "8.5")}
            >
              Check Eligibility
            </Button>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <p className="text-sm text-blue-800">Actual loan amount and interest rate may vary based on your credit score and eligibility. All applications are subject to approval.</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalLoanPage;
