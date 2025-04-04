
import { CreditScoreData, Transaction } from "@/types";

// Mock initial credit score data
const initialCreditScore: CreditScoreData = {
  score: 750,
  maxScore: 900,
  lastUpdated: new Date(),
  paymentHistory: {
    onTimePayments: 45,
    latePayments: 2,
    missedPayments: 0,
  },
  creditUtilization: 15,
  factors: {
    positive: [
      "Regular on-time payments",
      "Low credit utilization",
      "Long credit history",
    ],
    negative: [
      "Recent credit inquiries",
    ],
  },
};

// Get credit score from localStorage or use initial data
export const getCreditScore = (): CreditScoreData => {
  const savedData = localStorage.getItem("creditScore");
  
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // Convert string date back to Date object
    parsedData.lastUpdated = new Date(parsedData.lastUpdated);
    return parsedData;
  }
  
  return initialCreditScore;
};

// Save credit score to localStorage
export const saveCreditScore = (creditScore: CreditScoreData): void => {
  localStorage.setItem("creditScore", JSON.stringify(creditScore));
};

// Calculate credit score based on transactions and existing score
export const calculateCreditScore = (
  transactions: Transaction[],
  currentScore: CreditScoreData
): CreditScoreData => {
  // Clone the current score to avoid modifying the original
  const newScore = JSON.parse(JSON.stringify(currentScore)) as CreditScoreData;
  
  // Update last updated date
  newScore.lastUpdated = new Date();
  
  // Count recent successful payments
  const recentCompletedPayments = transactions
    .filter(t => t.status === "completed" && t.type === "debit")
    .filter(t => {
      const transactionDate = new Date(t.date);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return transactionDate > oneMonthAgo;
    });
  
  // If there are recent payments, improve score slightly
  if (recentCompletedPayments.length > 0) {
    newScore.paymentHistory.onTimePayments += recentCompletedPayments.length;
    
    // Increase score based on payment history (max +10 points)
    const scoreIncrease = Math.min(recentCompletedPayments.length * 2, 10);
    newScore.score = Math.min(newScore.score + scoreIncrease, newScore.maxScore);
  }
  
  // Update factors
  if (recentCompletedPayments.length > 3) {
    if (!newScore.factors.positive.includes("Consistent payment pattern")) {
      newScore.factors.positive.push("Consistent payment pattern");
    }
  }
  
  // Calculate credit utilization (mock implementation)
  // In a real app, this would be based on credit limits and balances
  const utilizationChange = Math.random() * 2 - 1; // Random change between -1 and 1
  newScore.creditUtilization = Math.max(
    0,
    Math.min(100, newScore.creditUtilization + utilizationChange)
  );
  
  // Low utilization improves score
  if (newScore.creditUtilization < 20) {
    newScore.score = Math.min(newScore.score + 5, newScore.maxScore);
    if (!newScore.factors.positive.includes("Low credit utilization")) {
      newScore.factors.positive.push("Low credit utilization");
    }
  }
  
  return newScore;
};

// Update credit score after a new transaction
export const updateCreditScoreWithTransaction = (
  transaction: Transaction
): CreditScoreData => {
  const currentScore = getCreditScore();
  const transactions = [transaction];
  
  const updatedScore = calculateCreditScore(transactions, currentScore);
  saveCreditScore(updatedScore);
  
  return updatedScore;
};
