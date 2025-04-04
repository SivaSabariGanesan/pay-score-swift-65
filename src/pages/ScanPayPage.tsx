
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ScanPayPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Scan & Pay</h1>
        </div>
      </header>
      
      <QRScanner onClose={() => navigate("/")} />
    </div>
  );
};

export default ScanPayPage;
