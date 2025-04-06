
import { Transaction, PaymentRequest } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

// Helper function to initialize mock user data
export const initializeUserData = () => {
  // Initialize transactions if not present
  if (!localStorage.getItem("transactions")) {
    const mockTransactions = [
      {
        id: uuidv4(),
        type: "credit",
        amount: 2500,
        from: "Salary",
        to: "Your Account",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        status: "completed",
        description: "Monthly Salary"
      },
      {
        id: uuidv4(),
        type: "debit",
        amount: 650,
        from: "Your Account",
        to: "Electricity Bill",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        status: "completed",
        description: "Monthly Bill Payment"
      },
      {
        id: uuidv4(),
        type: "credit",
        amount: 1200,
        from: "Client Payment",
        to: "Your Account",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: "completed",
        description: "Freelance Work"
      },
      {
        id: uuidv4(),
        type: "debit",
        amount: 800,
        from: "Your Account",
        to: "Grocery Store",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: "completed",
        description: "Weekly Groceries"
      },
      {
        id: uuidv4(),
        type: "debit",
        amount: 120,
        from: "Your Account",
        to: "Coffee Shop",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: "completed",
        description: "Coffee with Friends"
      }
    ];
    localStorage.setItem("transactions", JSON.stringify(mockTransactions));
  }
  
  // Initialize user balance if not present
  if (!localStorage.getItem("userBalance")) {
    localStorage.setItem("userBalance", "5000");
  }
};

// Get all transactions
export const getTransactions = (): Transaction[] => {
  const transactions = localStorage.getItem("transactions");
  return transactions ? JSON.parse(transactions) : [];
};

// Add a new transaction
export const addTransaction = (transaction: Transaction) => {
  const transactions = getTransactions();
  transactions.unshift(transaction); // Add to beginning of array
  localStorage.setItem("transactions", JSON.stringify(transactions));
  
  // Trigger storage event for other tabs/components
  window.dispatchEvent(new Event("storage"));
};

// Update user balance
export const updateUserBalance = (amount: number) => {
  const currentBalance = parseFloat(localStorage.getItem("userBalance") || "0");
  const newBalance = currentBalance + amount;
  localStorage.setItem("userBalance", newBalance.toString());
  
  // Update user object if it exists
  const userJson = localStorage.getItem("user");
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      user.balance = newBalance;
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error updating user balance:", error);
    }
  }
  
  // Trigger storage event for other tabs/components
  window.dispatchEvent(new Event("storage"));
};

// Process payment with Razorpay
export const processPayment = async (paymentDetails: PaymentRequest): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Processing payment with Razorpay", paymentDetails);
      
      if (!(window as any).Razorpay) {
        console.error("Razorpay SDK not loaded");
        
        // Dynamically load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        
        script.onload = () => {
          console.log("Razorpay script loaded successfully");
          initializeRazorpay(paymentDetails, resolve, reject);
        };
        
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          reject(new Error("Failed to load Razorpay SDK"));
        };
        
        document.body.appendChild(script);
      } else {
        console.log("Razorpay SDK already loaded");
        initializeRazorpay(paymentDetails, resolve, reject);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      reject(error);
    }
  });
};

// Helper function to initialize Razorpay checkout
const initializeRazorpay = (
  paymentDetails: PaymentRequest,
  resolve: (value: boolean) => void,
  reject: (reason?: any) => void
) => {
  try {
    const RazorpayCheckout = (window as any).Razorpay;
    
    if (!RazorpayCheckout) {
      throw new Error("Razorpay SDK not available");
    }
    
    const options = {
      key: "rzp_test_QCsADCKZO5Qzs2", // Test key
      amount: paymentDetails.amount * 100, // Amount in paise
      currency: "INR",
      name: "TransPay",
      description: paymentDetails.description || "Payment",
      image: "https://i.ibb.co/YDYS80K/shield.png",
      handler: function (response: any) {
        console.log("Payment successful", response);
        
        // Create transaction record
        const transaction = {
          id: uuidv4(),
          type: "debit",
          amount: paymentDetails.amount,
          from: "You",
          to: paymentDetails.to,
          date: new Date(),
          status: "completed",
          description: paymentDetails.description || "Razorpay Payment",
          transactionId: response.razorpay_payment_id
        };
        
        // Add transaction to history
        addTransaction(transaction);
        
        // Update user balance
        updateUserBalance(-paymentDetails.amount);
        
        toast.success("Payment successful", {
          description: `Payment ID: ${response.razorpay_payment_id}`
        });
        
        resolve(true);
      },
      prefill: {
        name: "TransPay User",
        email: "user@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#3B82F6"
      },
      modal: {
        ondismiss: function() {
          console.log("Payment cancelled");
          
          toast.info("Payment cancelled");
          resolve(false);
        }
      }
    };
    
    const razorpay = new RazorpayCheckout(options);
    razorpay.open();
  } catch (error) {
    console.error("Error initializing Razorpay:", error);
    reject(error);
  }
};
