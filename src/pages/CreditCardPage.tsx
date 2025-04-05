
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CreditCard, Info, Star } from "lucide-react";
import { toast } from "sonner";

const CreditCardPage = () => {
  const navigate = useNavigate();
  
  const handleApplyClick = (cardName: string) => {
    toast.success("Credit card application initiated", {
      description: `Your application for ${cardName} is being processed.`
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/finance")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Credit Card Offers</h1>
        </div>
      </header>
      
      <div className="space-y-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Rewards Plus</span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="h-12 w-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Annual fee: ₹500</p>
              </div>
              <div className="text-right">
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">5% cashback on shopping</p>
                <p className="text-sm text-muted-foreground">2% on other spends</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => handleApplyClick("Rewards Plus Card")}
            >
              Apply Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Travel Elite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="h-12 w-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-md flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Annual fee: ₹2,000</p>
              </div>
              <div className="text-right">
                <div className="flex mb-1">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star className="h-4 w-4 text-gray-300" />
                </div>
                <p className="text-sm text-muted-foreground">10x rewards on travel</p>
                <p className="text-sm text-muted-foreground">Lounge access</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleApplyClick("Travel Elite Card")}
            >
              Apply Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fuel Saver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="h-12 w-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Annual fee: ₹0</p>
              </div>
              <div className="text-right">
                <div className="flex mb-1">
                  {[1, 2, 3].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  {[1, 2].map((star) => (
                    <Star key={star} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">5% fuel surcharge waiver</p>
                <p className="text-sm text-muted-foreground">1% on other spends</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleApplyClick("Fuel Saver Card")}
            >
              Apply Now
            </Button>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <p className="text-sm text-blue-800">Credit card approvals are subject to credit score check and eligibility criteria. Benefits and rewards may vary based on spending patterns.</p>
        </div>
      </div>
    </div>
  );
};

export default CreditCardPage;
