
// metamaskUtils.ts
import { PaymentRequest, Transaction } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { addTransaction } from "@/utils/razorpayUtils";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const detectEthereum = () => {
  return Boolean(window.ethereum);
};

const requestAccount = async (): Promise<string[]> => {
  if (!detectEthereum()) {
    throw new Error("Ethereum provider not detected. Please install MetaMask.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    
    // Make sure we return an array of strings
    if (Array.isArray(accounts)) {
      return accounts as string[];
    }
    
    throw new Error("Invalid response from MetaMask");
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    throw error;
  }
};

const getChainId = async (): Promise<string> => {
  if (!detectEthereum()) {
    throw new Error("Ethereum provider not detected. Please install MetaMask.");
  }

  try {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    
    // Ensure we return a string
    return String(chainId);
  } catch (error) {
    console.error("Error getting chain ID:", error);
    throw error;
  }
};

const getNetworkName = (chainId: string): string => {
  const networks: Record<string, string> = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0x89': 'Polygon Mainnet',
    '0x13881': 'Polygon Mumbai',
    '0xa86a': 'Avalanche Mainnet',
    '0xa869': 'Avalanche Fuji',
    '0x38': 'BNB Smart Chain',
    '0x61': 'BNB Testnet',
  };
  
  return networks[chainId] || `Chain ID: ${chainId}`;
};

export const sendTransaction = async (
  to: string,
  amount: number
): Promise<string> => {
  try {
    const accounts = await requestAccount();
    const fromAddress = accounts[0];
    const chainId = await getChainId();

    if (!fromAddress) {
      throw new Error("No account found. Please connect to MetaMask.");
    }

    // Convert amount to hex (wei)
    const amountInWei = (amount * 1e18).toString(16);
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: fromAddress,
          to,
          value: "0x" + amountInWei,
          gas: "0x5208", // 21000 gas (simple ETH transfer)
        },
      ],
    });

    return String(txHash); // Ensure we return a string
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
};

export const connectMetamask = async (): Promise<{ account: string; chainId: string; networkName: string }> => {
  try {
    const accounts = await requestAccount();
    const chainId = await getChainId();
    const networkName = getNetworkName(chainId);

    return {
      account: accounts[0],
      chainId,
      networkName
    };
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    throw error;
  }
};

// Process payments using MetaMask, now network-agnostic
export const processMetaMaskPayment = async (paymentDetails: PaymentRequest): Promise<boolean> => {
  try {
    const accounts = await requestAccount();
    const chainId = await getChainId();
    const networkName = getNetworkName(chainId);
    
    // For destination address, we're using a dummy address for the demo
    const recipientAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Example address
    
    // Convert INR to crypto (this is a simplified conversion)
    // In a real app, you would use an exchange rate API
    const cryptoAmount = paymentDetails.amount / 200000; // Example rate
    
    // Send the transaction
    const txHash = await sendTransaction(recipientAddress, cryptoAmount);
    
    console.log(`${networkName} transaction successful:`, txHash);
    
    // Create a transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      type: "debit",
      amount: paymentDetails.amount,
      description: paymentDetails.description,
      to: paymentDetails.to,
      date: new Date(),
      status: "completed",
      txHash,
      network: networkName.toLowerCase().split(' ')[0]
    };
    
    // Add transaction to history
    addTransaction(transaction);
    
    // Return true to indicate success
    return true;
  } catch (error) {
    console.error("MetaMask payment failed:", error);
    throw error;
  }
};

export default {
  detectEthereum,
  connectMetamask,
  sendTransaction,
  processMetaMaskPayment,
  getNetworkName,
};
