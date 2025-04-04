import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreditScore from "@/components/CreditScore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactions } from "../utils/creditScoreUtils"; // <-- Import from your utilities
import { Transaction } from "@/types"; // Make sure it matches your actual Transaction type

const CreditScorePage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const savedTransactions = getTransactions();
    setTransactions(savedTransactions);
  }, []);

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

      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <CreditScore />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <div key={txn.id} className="border rounded-lg p-3 shadow-sm bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{txn.description}</span>
                  <span
                    className={`font-bold ${
                      txn.type === "credit" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(txn.date).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No transactions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditScorePage;
