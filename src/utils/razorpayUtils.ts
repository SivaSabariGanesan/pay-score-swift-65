import { Http } from '@capacitor/http';
import { PaymentRequest, RazorpayOptions, Transaction } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { updateCreditScoreWithTransaction } from "./creditScoreUtils";

const RAZORPAY_KEY_ID = "rzp_test_eDVMj23yL98Hvt";
const BACKEND_URL = "https://pay-score-swift-1.onrender.com/create-order";

// Get transactions from localStorage
export const getTransactions = (): Transaction[] => {
  const savedTransactions = localStorage.getItem("transactions");
  return savedTransactions 
    ? JSON.parse(savedTransactions, (key, value) => {
        if (key === 'date' && value) return new Date(value);
        return value;
      }) 
    : [];
};

// Save transactions to localStorage
export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// Add transaction and update credit score
export const addTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  saveTransactions(transactions);
  updateCreditScoreWithTransaction(transaction);

  toast.success(
    transaction.type === "debit"
      ? `Payment of ₹${transaction.amount} sent`
      : `Received ₹${transaction.amount}`,
    { description: transaction.description }
  );
};

// Create Razorpay Order using Capacitor HTTP
export const createOrderId = async (amount: number): Promise<string> => {
  const response = await Http.request({
    method: "POST",
    url: BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
    },
    data: { amount },
  });

  if (!response || !response.data?.id) throw new Error("Failed to create order");
  return response.data.id;
};

// Process Razorpay Payment
export const processPayment = async (paymentRequest: PaymentRequest): Promise<boolean> => {
  try {
    if (!(window as any).Razorpay) throw new Error("Razorpay SDK not loaded");

    const response = await Http.request({
      method: "POST",
      url: BACKEND_URL,
      headers: {
        "Content-Type": "application/json",
      },
      data: { amount: paymentRequest.amount },
    });

    if (!response || !response.data?.id) throw new Error("Failed to create order");

    const { id: orderId, amount } = response.data;

    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Pay Swift",
        description: paymentRequest.description,
        order_id: orderId,
        handler: function () {
          const transaction: Transaction = {
            id: uuidv4(),
            type: "debit",
            amount: paymentRequest.amount,
            description: paymentRequest.description,
            to: paymentRequest.to,
            date: new Date(),
            status: "completed",
          };
          addTransaction(transaction);
          const currentBalance = parseFloat(localStorage.getItem("userBalance") || "5000");
          localStorage.setItem("userBalance", (currentBalance - paymentRequest.amount).toFixed(2));
          toast.success("Payment successful");
          resolve(true);
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4285F4",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (res: any) {
        const transaction: Transaction = {
          id: uuidv4(),
          type: "debit",
          amount: paymentRequest.amount,
          description: paymentRequest.description,
          to: paymentRequest.to,
          date: new Date(),
          status: "failed",
        };

        addTransaction(transaction);

        toast.error("Payment failed", {
          description: res.error?.description || "Please try again later",
        });

        reject(new Error("Payment failed"));
      });
    });
  } catch (err) {
    console.error("Payment processing error:", err);
    toast.error("Payment error", {
      description: err instanceof Error ? err.message : "Something went wrong",
    });
    return false;
  }
};

// Initialize mock user data
export const initializeUserData = (): void => {
  if (!localStorage.getItem("userBalance")) {
    localStorage.setItem("userBalance", "5000");
  }

  if (!localStorage.getItem("transactions")) {
    const initialTransactions: Transaction[] = [
      {
        id: uuidv4(),
        type: "debit",
        amount: 250,
        description: "Grocery Shopping",
        to: "SuperMart",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "completed",
      },
      {
        id: uuidv4(),
        type: "credit",
        amount: 1000,
        description: "Refund",
        from: "Online Store",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "completed",
      },
      {
        id: uuidv4(),
        type: "debit",
        amount: 150,
        description: "Coffee Shop",
        to: "Brew Co.",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: "completed",
      },
    ];
    saveTransactions(initialTransactions);
  }
};
