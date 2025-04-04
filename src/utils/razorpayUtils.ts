
import { PaymentRequest, RazorpayOptions, Transaction } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { updateCreditScoreWithTransaction } from "./creditScoreUtils";

// Razorpay API keys (Test keys provided by the user)
const RAZORPAY_KEY_ID = "rzp_test_eDVMj23yL98Hvt";
const RAZORPAY_KEY_SECRET = "LOr3SG3XRnMpgduiMYqljwgH";

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
  const response = await fetch("http://localhost:5000/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) throw new Error("Failed to create order");

  const data = await response.json();
  return data.id; // Razorpay order_id
};


// Process payment using Razorpay
export const processPayment = async (paymentRequest: PaymentRequest): Promise<boolean> => {
  try {
    if (!(window as any).Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    const amountInPaisa = Math.round(paymentRequest.amount * 100);

    // Call your backend to create Razorpay order
    const response = await fetch("http://localhost:5000/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: paymentRequest.amount }),
    });

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const { id: orderId, amount } = await response.json();

    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: amount, // Already in paisa from backend
        currency: "INR",
        name: "Pay Swift",
        description: paymentRequest.description,
        order_id: orderId,
        handler: function (res: any) {
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
