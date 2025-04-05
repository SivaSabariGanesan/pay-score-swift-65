
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreditScore from "@/components/CreditScore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, History, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell 
} from "@/components/ui/table";
import { getTransactions } from "../utils/creditScoreUtils";
import { Transaction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CreditScorePage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const savedTransactions = getTransactions();
    setTransactions(savedTransactions);
    
    // Listen for transaction updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "transactions") {
        const updatedTransactions = getTransactions();
        setTransactions(updatedTransactions);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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

      <div className="bg-white rounded-xl shadow-md p-5 mb-6 animate-fade-in">
        <CreditScore />
      </div>

      <Tabs defaultValue="history" className="w-full animate-fade-in">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Score Impact
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Transaction History</span>
                <Button variant="ghost" size="sm" className="text-xs px-2" onClick={() => navigate("/history")}>
                  View All <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </CardTitle>
              <CardDescription>Recent financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((txn) => (
                        <TableRow key={txn.id} className="hover:bg-gray-50">
                          <TableCell className="text-xs text-gray-500">
                            {formatDate(new Date(txn.date))}
                          </TableCell>
                          <TableCell className="font-medium">
                            {txn.description}
                            <div className="text-xs text-gray-500">
                              {txn.type === "credit" ? "From: " + (txn.from || "Unknown") : "To: " + (txn.to || "Unknown")}
                            </div>
                          </TableCell>
                          <TableCell className={`font-bold ${txn.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                            {txn.type === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                txn.status === "completed" ? "default" : 
                                txn.status === "pending" ? "outline" : "destructive"
                              }
                              className="text-xs"
                            >
                              {txn.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No transactions found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="impact">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Score Impact Analysis</CardTitle>
              <CardDescription>How transactions affect your score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-green-700 mb-1">Positive Impact</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                        <span>On-time payments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                        <span>Low credit utilization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                        <span>Regular transactions</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-red-700 mb-1">Negative Impact</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                        <span>Late payments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                        <span>High credit utilization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                        <span>Multiple inquiries</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="border p-4 rounded-lg bg-blue-50">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Recent Score Changes</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 3).map((txn) => (
                      <div key={txn.id} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <span className="font-medium">{txn.description}</span>
                          <div className="text-xs text-gray-500">{formatDate(new Date(txn.date))}</div>
                        </div>
                        <div className="text-right">
                          <span className={txn.status === "completed" ? "text-green-600" : "text-gray-500"}>
                            {txn.status === "completed" ? "+2 points" : "pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-2">No recent changes</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditScorePage;
