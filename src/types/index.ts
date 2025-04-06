
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  balance: number;
  walletAddress?: string;
  chainId?: string;
  creditScore: CreditScoreData;
  recentTransactions: Transaction[];
}

export interface CreditScoreData {
  score: number;
  maxScore: number;
  lastUpdated: Date;
  paymentHistory: {
    onTimePayments: number;
    latePayments: number;
    missedPayments: number;
  };
  creditUtilization: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  loanInformation?: {
    activeLoans: number;
    totalLoanAmount: number;
    onTimeLoanPayments: number;
  };
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  from: string;
  to: string;
  date: Date;
  status: "pending" | "completed" | "failed";
  description: string;
  transactionId?: string;
  transactionHash?: string;
  category?: string;
  productDetails?: {
    type: string;
    name: string;
    interestRate?: string;
    term?: string;
    provider?: string;
  };
}

export interface PaymentRequest {
  amount: number;
  to: string;
  description?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

// Extend the global Window interface to include ethereum for TypeScript
declare global {
  interface Window {
    ethereum?: any;
    google?: any;
    Razorpay?: any;
  }
}
