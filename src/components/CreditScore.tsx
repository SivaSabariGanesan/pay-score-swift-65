
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditScoreData } from "@/types";
import { getCreditScore } from "@/utils/creditScoreUtils";

const CreditScore = () => {
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null);

  useEffect(() => {
    // Get credit score data
    const score = getCreditScore();
    setCreditScore(score);
    
    // Listen for credit score updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "creditScore") {
        const updatedScore = getCreditScore();
        setCreditScore(updatedScore);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (!creditScore) {
    return <div>Loading credit score data...</div>;
  }

  // Calculate score percentage for progress bar
  const scorePercentage = (creditScore.score / creditScore.maxScore) * 100;
  
  // Determine score rating
  const getScoreRating = (score: number) => {
    if (score >= 750) return { text: "Excellent", color: "bg-green-500" };
    if (score >= 700) return { text: "Good", color: "bg-emerald-500" };
    if (score >= 650) return { text: "Fair", color: "bg-yellow-500" };
    if (score >= 600) return { text: "Poor", color: "bg-orange-500" };
    return { text: "Very Poor", color: "bg-red-500" };
  };
  
  const scoreRating = getScoreRating(creditScore.score);
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Your Credit Score</span>
            <Badge className={scoreRating.color + " text-white"}>
              {scoreRating.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8 text-center">
            <div className="credit-score-gauge">
              <Progress value={scorePercentage} className="h-4 w-full" />
              <div className="credit-score-value">
                {creditScore.score}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Out of {creditScore.maxScore} • Updated on {formatDate(creditScore.lastUpdated)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment History</h3>
              <p className="text-lg font-bold">{creditScore.paymentHistory.onTimePayments} on-time</p>
              {creditScore.paymentHistory.latePayments > 0 && (
                <p className="text-sm text-orange-500">
                  {creditScore.paymentHistory.latePayments} late
                </p>
              )}
              {creditScore.paymentHistory.missedPayments > 0 && (
                <p className="text-sm text-red-500">
                  {creditScore.paymentHistory.missedPayments} missed
                </p>
              )}
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Credit Utilization</h3>
              <p className="text-lg font-bold">{creditScore.creditUtilization}%</p>
              <Progress 
                value={creditScore.creditUtilization} 
                className="h-2 mt-2" 
              />
            </div>
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-green-600 mb-2">
                Positive Factors
              </h3>
              <ul className="space-y-1">
                {creditScore.factors.positive.map((factor, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            
            {creditScore.factors.negative.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-600 mb-2">
                  Areas for Improvement
                </h3>
                <ul className="space-y-1">
                  {creditScore.factors.negative.map((factor, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>How Credit Score Works</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your credit score is calculated based on your payment history, 
            credit utilization, length of credit history, and recent activity. 
            Making payments on time and keeping your credit utilization low 
            will help improve your score over time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditScore;
