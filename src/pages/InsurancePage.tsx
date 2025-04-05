
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Home, Info, ShieldCheck, Umbrella } from "lucide-react";
import { toast } from "sonner";

const InsurancePage = () => {
  const navigate = useNavigate();
  
  const handleViewClick = (plan: string) => {
    toast.success("Insurance plan details", {
      description: `Showing details for ${plan} insurance plan.`
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/finance")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Insurance Plans</h1>
        </div>
      </header>
      
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Health Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Family Floater</p>
                <p className="text-sm text-muted-foreground">Cover up to 4 family members</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹5 Lakhs</p>
                <p className="text-sm text-muted-foreground">Starting at ₹1,200/month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Cashless Hospitals</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>No Medical Tests</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Free Health Checkup</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Tax Benefits</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => handleViewClick("Health")}
            >
              View Plans
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Umbrella className="h-5 w-5 text-blue-500 mr-2" />
              Term Life Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Term Plan</p>
                <p className="text-sm text-muted-foreground">Cover up to age 75</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹1 Crore</p>
                <p className="text-sm text-muted-foreground">Starting at ₹800/month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Critical Illness Cover</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Accidental Death Benefit</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Terminal Illness Cover</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Tax Benefits</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleViewClick("Term Life")}
            >
              View Plans
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Home className="h-5 w-5 text-green-500 mr-2" />
              Home Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Home Secure</p>
                <p className="text-sm text-muted-foreground">Structure & Contents</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Customizable</p>
                <p className="text-sm text-muted-foreground">Starting at ₹2,000/year</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Fire Protection</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Theft Coverage</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Natural Disasters</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <span>Liability Coverage</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleViewClick("Home")}
            >
              View Plans
            </Button>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <p className="text-sm text-blue-800">Insurance is subject to terms and conditions of the insurance service provider. Please read the policy document carefully before purchasing.</p>
        </div>
      </div>
    </div>
  );
};

export default InsurancePage;
