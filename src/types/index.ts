
export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  to?: string;
  from?: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
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
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  creditScore: CreditScoreData;
  recentTransactions: Transaction[];
}

export interface PaymentRequest {
  amount: number;
  to: string;
  description: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}
