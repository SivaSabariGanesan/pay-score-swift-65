
import { PaymentRequest, RazorpayOptions, Transaction } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { updateCreditScoreWithTransaction } from "./creditScoreUtils";

// Test Razorpay API key (Replace with actual test key from Razorpay dashboard)
const TEST_RAZORPAY_KEY = "rzp_test_yourTestKeyHere";

// Get or initialize transactions from localStorage
export const getTransactions = (): Transaction[] => {
  const savedTransactions = localStorage.getItem("transactions");
  return savedTransactions 
    ? JSON.parse(savedTransactions, (key, value) => {
        // Convert date strings back to Date objects
        if (key === 'date' && value) {
          return new Date(value);
        }
        return value;
      }) 
    : [];
};

// Save transactions to localStorage
export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// Add a new transaction and update credit score
export const addTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.unshift(transaction); // Add to beginning of array
  saveTransactions(transactions);
  
  // Update credit score based on the new transaction
  updateCreditScoreWithTransaction(transaction);
  
  // Notify user
  toast.success(
    transaction.type === "debit"
      ? `Payment of ₹${transaction.amount} sent`
      : `Received ₹${transaction.amount}`,
    {
      description: transaction.description,
    }
  );
};

// Create a mock order ID (in a real app, this would come from your backend)
export const createOrderId = async (amount: number): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return `order_${Date.now()}`;
};

// Process payment using Razorpay
export const processPayment = async (paymentRequest: PaymentRequest): Promise<boolean> => {
  try {
    // Check if Razorpay is loaded
    if (!(window as any).Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }
    
    // Convert amount to paisa (Razorpay requires amount in lowest denomination)
    const amountInPaisa = Math.round(paymentRequest.amount * 100);
    
    // Create order ID (in a real app, this would be created on your backend)
    const orderId = await createOrderId(amountInPaisa);
    
    // Return promise that resolves when payment is complete
    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: TEST_RAZORPAY_KEY,
        amount: amountInPaisa,
        currency: "INR",
        name: "Pay Swift",
        description: paymentRequest.description,
        order_id: orderId,
        handler: function(response: any) {
          // Create transaction record
          const transaction: Transaction = {
            id: uuidv4(),
            type: "debit",
            amount: paymentRequest.amount,
            description: paymentRequest.description,
            to: paymentRequest.to,
            date: new Date(),
            status: "completed",
          };
          
          // Add transaction to history and update credit score
          addTransaction(transaction);
          
          // Update user balance (in a real app, this would be done on the backend)
          const currentBalance = parseFloat(localStorage.getItem("userBalance") || "5000");
          localStorage.setItem("userBalance", (currentBalance - paymentRequest.amount).toString());
          
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
      
      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
      
      razorpayInstance.on("payment.failed", function(response: any) {
        // Create failed transaction record
        const transaction: Transaction = {
          id: uuidv4(),
          type: "debit",
          amount: paymentRequest.amount,
          description: paymentRequest.description,
          to: paymentRequest.to,
          date: new Date(),
          status: "failed",
        };
        
        // Add failed transaction to history
        addTransaction(transaction);
        
        toast.error("Payment failed", {
          description: response.error.description || "Please try again later",
        });
        
        reject(new Error("Payment failed"));
      });
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    toast.error("Payment processing error", {
      description: "Please try again later",
    });
    return false;
  }
};

// Initialize mock data
export const initializeUserData = (): void => {
  // Set initial balance if not exists
  if (!localStorage.getItem("userBalance")) {
    localStorage.setItem("userBalance", "5000");
  }
  
  // Add some initial transactions if none exist
  if (!localStorage.getItem("transactions")) {
    const initialTransactions: Transaction[] = [
      {
        id: uuidv4(),
        type: "debit",
        amount: 250,
        description: "Grocery Shopping",
        to: "SuperMart",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: "completed",
      },
      {
        id: uuidv4(),
        type: "credit",
        amount: 1000,
        description: "Refund",
        from: "Online Store",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: "completed",
      },
      {
        id: uuidv4(),
        type: "debit",
        amount: 150,
        description: "Coffee Shop",
        to: "Brew Co.",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        status: "completed",
      },
    ];
    
    saveTransactions(initialTransactions);
  }
};
