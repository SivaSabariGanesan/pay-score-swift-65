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
  return saved ? JSON.parse(saved) : [];
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// --- Credit Score Logic ---
export const calculateCreditScore = (
  transactions: Transaction[],
  currentScore: CreditScoreData
): CreditScoreData => {
  const newScore = JSON.parse(JSON.stringify(currentScore)) as CreditScoreData;
  newScore.lastUpdated = new Date();

  const recentCompletedPayments = transactions
    .filter(t => t.status === "completed" && t.type === "debit")
    .filter(t => {
      const transactionDate = new Date(t.date);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return transactionDate > oneMonthAgo;
    });

  if (recentCompletedPayments.length > 0) {
    newScore.paymentHistory.onTimePayments += recentCompletedPayments.length;
    const scoreIncrease = Math.min(recentCompletedPayments.length * 2, 10);
    newScore.score = Math.min(newScore.score + scoreIncrease, newScore.maxScore);
  }

  if (recentCompletedPayments.length > 3) {
    if (!newScore.factors.positive.includes("Consistent payment pattern")) {
      newScore.factors.positive.push("Consistent payment pattern");
    }
  }

  const utilizationChange = Math.random() * 2 - 1;
  newScore.creditUtilization = parseFloat(
  Math.max(0, Math.min(100, newScore.creditUtilization + utilizationChange)).toFixed(1)
);


  if (newScore.creditUtilization < 20) {
    newScore.score = Math.min(newScore.score + 5, newScore.maxScore);
    if (!newScore.factors.positive.includes("Low credit utilization")) {
      newScore.factors.positive.push("Low credit utilization");
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
  const updatedTransactions = [...allTransactions, transaction];
  const updatedScore = calculateCreditScore([transaction], currentScore);

  saveCreditScore(updatedScore);
  saveTransactions(updatedTransactions);

  return updatedScore;
};
