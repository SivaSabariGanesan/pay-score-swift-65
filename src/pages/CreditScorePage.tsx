
import { Button } from "@/components/ui/button";
import CreditScore from "@/components/CreditScore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CreditScorePage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Credit Score</h1>
        </div>
      </header>
      
      <div className="bg-white rounded-xl shadow-md p-5">
        <CreditScore />
      </div>
    </div>
  );
};

export default CreditScorePage;
