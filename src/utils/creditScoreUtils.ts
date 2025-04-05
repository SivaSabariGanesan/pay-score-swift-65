
import { CreditScoreData, Transaction } from "@/types";

// --- Initial Credit Score ---
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
    negative: ["Recent credit inquiries"],
  },
};

// --- Get Credit Score ---
export const getCreditScore = (): CreditScoreData => {
  const savedData = localStorage.getItem("creditScore");
  if (savedData) {
    const parsed = JSON.parse(savedData);
    parsed.lastUpdated = new Date(parsed.lastUpdated);
    return parsed;
  }
  return initialCreditScore;
};

export const saveCreditScore = (creditScore: CreditScoreData): void => {
  localStorage.setItem("creditScore", JSON.stringify(creditScore));
};

// --- Get and Save Transactions ---
export const getTransactions = (): Transaction[] => {
  const saved = localStorage.getItem("transactions");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure proper Date objects for all transactions
      return parsed.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    } catch (error) {
      console.error("Error parsing transactions:", error);
      return [];
    }
  }
  return [];
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// --- Credit Score Logic ---
export const calculateCreditScore = (
  transaction: Transaction,
  currentScore: CreditScoreData
): CreditScoreData => {
  const newScore = JSON.parse(JSON.stringify(currentScore)) as CreditScoreData;
  newScore.lastUpdated = new Date();

  // Only completed transactions affect the score
  if (transaction.status === "completed") {
    // Payment behavior - debit transactions (payments made)
    if (transaction.type === "debit") {
      newScore.paymentHistory.onTimePayments += 1;
      // Increase score for on-time payments (between 1-5 points based on amount)
      const scoreIncrease = Math.min(Math.max(1, Math.floor(transaction.amount / 500)), 5);
      newScore.score = Math.min(newScore.score + scoreIncrease, newScore.maxScore);
      
      // Add positive factor if not already there
      if (!newScore.factors.positive.includes("Regular on-time payments")) {
        newScore.factors.positive.push("Regular on-time payments");
      }
      
      // Remove negative factor if exists
      const missedIndex = newScore.factors.negative.indexOf("Missed payments");
      if (missedIndex > -1) {
        newScore.factors.negative.splice(missedIndex, 1);
      }
      
      // Adjust credit utilization (simulated)
      const utilizationChange = (Math.random() * 2 - 1) * (transaction.amount / 5000);
      newScore.creditUtilization = Math.max(0, Math.min(100, 
        parseFloat((newScore.creditUtilization + utilizationChange).toFixed(1))
      ));
    }
    
    // Receiving money (credit transactions)
    if (transaction.type === "credit") {
      // Small positive impact for receiving payments
      const smallIncrease = Math.min(1, transaction.amount / 2000);
      newScore.score = Math.min(newScore.score + smallIncrease, newScore.maxScore);
      
      // Slightly decrease credit utilization when receiving money
      newScore.creditUtilization = Math.max(0, 
        parseFloat((newScore.creditUtilization - 0.2).toFixed(1))
      );
    }
    
    // Add positive factors based on behavior patterns
    const allTransactions = getTransactions();
    const recentTransactions = allTransactions.filter(t => {
      const txnDate = new Date(t.date);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return txnDate > oneMonthAgo;
    });
    
    // Active account with regular transactions
    if (recentTransactions.length >= 5) {
      if (!newScore.factors.positive.includes("Active financial account")) {
        newScore.factors.positive.push("Active financial account");
      }
    }
    
    // Low credit utilization is good
    if (newScore.creditUtilization < 30) {
      if (!newScore.factors.positive.includes("Low credit utilization")) {
        newScore.factors.positive.push("Low credit utilization");
      }
      
      const highUtilIndex = newScore.factors.negative.indexOf("High credit utilization");
      if (highUtilIndex > -1) {
        newScore.factors.negative.splice(highUtilIndex, 1);
      }
    } else if (newScore.creditUtilization > 50) {
      // High utilization is bad
      if (!newScore.factors.negative.includes("High credit utilization")) {
        newScore.factors.negative.push("High credit utilization");
      }
      
      const lowUtilIndex = newScore.factors.positive.indexOf("Low credit utilization");
      if (lowUtilIndex > -1) {
        newScore.factors.positive.splice(lowUtilIndex, 1);
      }
    }
  } else if (transaction.status === "failed") {
    // Failed payments can have a small negative impact
    newScore.score = Math.max(newScore.score - 1, 300); // Prevent going below 300
    
    // Add a negative factor if multiple failed transactions
    const failedTransactions = getTransactions().filter(t => t.status === "failed").length;
    if (failedTransactions >= 3) {
      if (!newScore.factors.negative.includes("Multiple failed transactions")) {
        newScore.factors.negative.push("Multiple failed transactions");
      }
    }
  }

  return newScore;
};

// --- Update Score and Store Transaction ---
export const updateCreditScoreWithTransaction = (
  transaction: Transaction
): CreditScoreData => {
  const currentScore = getCreditScore();
  const allTransactions = getTransactions();
  
  // Add the new transaction to the list
  const updatedTransactions = [transaction, ...allTransactions];
  
  // Calculate the new credit score based on the transaction
  const updatedScore = calculateCreditScore(transaction, currentScore);

  // Save the updated credit score and transactions
  saveCreditScore(updatedScore);
  saveTransactions(updatedTransactions);

  // Return the updated score
  return updatedScore;
};

// Initialize credit score if not present
export const initializeCreditScore = (): void => {
  if (!localStorage.getItem("creditScore")) {
    saveCreditScore(initialCreditScore);
  }
};
