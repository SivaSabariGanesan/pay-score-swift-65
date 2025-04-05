
// metamaskUtils.ts
// Using the type definition from types/index.ts instead of redefining it here
import { PaymentRequest } from "@/types";

// Remove the duplicate declaration as it's already in types/index.ts
// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

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

export const sendTransaction = async (
  to: string,
  amountInEther: number
): Promise<string> => {
  try {
    const accounts = await requestAccount();
    const fromAddress = accounts[0];

    if (!fromAddress) {
      throw new Error("No account found. Please connect to MetaMask.");
    }

    // Convert amount to hex (wei)
    const amountInWei = (amountInEther * 1e18).toString(16);
    
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

export const connectMetamask = async (): Promise<{ account: string; chainId: string }> => {
  try {
    const accounts = await requestAccount();
    const chainId = await getChainId();

    return {
      account: accounts[0],
      chainId,
    };
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    throw error;
  }
};

// Add the processMetaMaskPayment function
export const processMetaMaskPayment = async (paymentDetails: PaymentRequest): Promise<boolean> => {
  try {
    // Convert INR to ETH (this is a simplified conversion)
    // In a real app, you would use an exchange rate API
    const estimatedEthAmount = paymentDetails.amount / 200000; // Example rate: 1 ETH = 200,000 INR
    
    // For destination address, we're using a dummy address for the demo
    // In a real app, you would use the actual recipient's Ethereum address
    const recipientAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Example address
    
    // Send the transaction
    const txHash = await sendTransaction(recipientAddress, estimatedEthAmount);
    
    console.log("MetaMask transaction successful:", txHash);
    
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
};
