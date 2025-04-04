
import { PaymentRequest, Transaction } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { addTransaction } from "./razorpayUtils";

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && 
    window.ethereum !== undefined && 
    window.ethereum.isMetaMask === true;
};

// Get MetaMask Ethereum provider
export const getEthereumProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }
  return window.ethereum;
};

// Connect to MetaMask
export const connectMetaMask = async (): Promise<string[]> => {
  try {
    const ethereum = getEthereumProvider();
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
  } catch (error) {
    console.error("Failed to connect to MetaMask:", error);
    toast.error("Failed to connect to MetaMask", {
      description: "Please ensure MetaMask is installed and unlocked",
    });
    throw error;
  }
};

// Convert INR to ETH (This is a simplified mock implementation)
// In a real application, you would use a price feed or API for the current exchange rate
export const convertINRtoETH = (amountINR: number): number => {
  // Mock exchange rate: 1 ETH = 250,000 INR (this should be dynamic in a real app)
  const exchangeRate = 250000;
  return amountINR / exchangeRate;
};

// Process payment using MetaMask
export const processMetaMaskPayment = async (paymentRequest: PaymentRequest): Promise<boolean> => {
  try {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask is not installed", {
        description: "Please install MetaMask to continue with this payment method",
      });
      return false;
    }

    // Get user accounts
    const accounts = await connectMetaMask();
    if (accounts.length === 0) {
      toast.error("No MetaMask accounts found", {
        description: "Please connect an account in MetaMask",
      });
      return false;
    }

    const fromAddress = accounts[0];
    
    // Convert INR to ETH for the transaction
    const ethAmount = convertINRtoETH(paymentRequest.amount);
    const ethAmountHex = `0x${(ethAmount * 1e18).toString(16)}`;
    
    // Mock recipient address (in a real app, this would be a valid Ethereum address)
    const toAddress = "0x1234567890123456789012345678901234567890";
    
    // Request transaction
    const transactionParams = {
      from: fromAddress,
      to: toAddress,
      value: ethAmountHex,
      gas: '0x5208', // 21000 gas limit in hex
    };
    
    const ethereum = getEthereumProvider();
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParams],
    });
    
    if (txHash) {
      // Create transaction record
      const transaction: Transaction = {
        id: uuidv4(),
        type: "debit",
        amount: paymentRequest.amount,
        description: `${paymentRequest.description} (via MetaMask)`,
        to: paymentRequest.to,
        date: new Date(),
        status: "completed",
        txHash: txHash,
      };
      
      // Add transaction to history
      addTransaction(transaction);
      
      // Update user balance (in a real app, this would be done differently)
      const currentBalance = parseFloat(localStorage.getItem("userBalance") || "5000");
      localStorage.setItem("userBalance", (currentBalance - paymentRequest.amount).toString());
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("MetaMask payment error:", error);
    let errorMessage = "An error occurred during MetaMask payment";
    
    // Handle MetaMask specific errors
    if (error.code === 4001) {
      errorMessage = "Transaction rejected by user";
    }
    
    toast.error("Payment failed", {
      description: errorMessage,
    });
    
    return false;
  }
};
