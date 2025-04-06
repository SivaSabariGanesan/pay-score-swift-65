
import { PaymentRequest, Transaction } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { addTransaction } from "@/utils/razorpayUtils";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: {
        method: string;
        params?: unknown[] | object;
      }) => Promise<unknown>;
    };
  }
}

export const detectEthereum = () => {
  return Boolean(window.ethereum);
};

export const requestAccount = async (): Promise<string[]> => {
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

export const switchToPolygonNetwork = async (): Promise<void> => {
  if (!detectEthereum()) {
    throw new Error("Ethereum provider not detected");
  }

  const POLYGON_MUMBAI_CHAIN_ID = '0x13881'; // Testnet
  const POLYGON_MAINNET_CHAIN_ID = '0x89'; // Mainnet

  try {
    // Try to switch to Polygon network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_MUMBAI_CHAIN_ID }], // Using Mumbai testnet for development
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: POLYGON_MUMBAI_CHAIN_ID,
              chainName: 'Polygon Mumbai Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
            },
          ],
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
};

export const sendPolygonTransaction = async (
  to: string,
  amountInMatic: number
): Promise<string> => {
  try {
    await switchToPolygonNetwork();
    const accounts = await requestAccount();
    const fromAddress = accounts[0];

    if (!fromAddress) {
      throw new Error("No account found. Please connect to MetaMask.");
    }

    // Convert amount to hex (wei)
    const amountInWei = (amountInMatic * 1e18).toString(16);
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: fromAddress,
          to,
          value: "0x" + amountInWei,
          gas: "0x5208", // 21000 gas (simple MATIC transfer)
        },
      ],
    });

    return String(txHash); // Ensure we return a string
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
};

// Process payments on Polygon network
export const processPolygonTransaction = async (paymentDetails: PaymentRequest): Promise<boolean> => {
  try {
    // For destination address, we're using a dummy address for the demo
    // In a real app, you would use the actual recipient's Polygon address
    const recipientAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Example address
    
    // Convert INR to MATIC (this is a simplified conversion)
    // In a real app, you would use an exchange rate API
    const estimatedMaticAmount = paymentDetails.amount / 150000; // Example rate: 1 MATIC = 150 INR
    
    // Switch to Polygon network first
    await switchToPolygonNetwork();
    
    // Send the transaction
    const txHash = await sendPolygonTransaction(recipientAddress, estimatedMaticAmount);
    
    console.log("Polygon transaction successful:", txHash);
    
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
      network: "polygon"
    };
    
    // Add transaction to history
    addTransaction(transaction);
    
    // Return true to indicate success
    return true;
  } catch (error) {
    console.error("Polygon payment failed:", error);
    throw error;
  }
};

export default {
  detectEthereum,
  requestAccount,
  switchToPolygonNetwork,
  sendPolygonTransaction,
  processPolygonTransaction,
};
