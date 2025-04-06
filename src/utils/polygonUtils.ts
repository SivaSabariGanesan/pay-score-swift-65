
import { PaymentRequest } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { addTransaction, updateUserBalance } from "./razorpayUtils";
import { connectMetamask, switchNetwork } from "./metamaskUtils";

// Constants for Polygon network
const POLYGON_MAINNET_CHAIN_ID = "0x89";
const POLYGON_TESTNET_CHAIN_ID = "0x13881"; // Mumbai testnet

export const processPolygonTransaction = async (paymentRequest: PaymentRequest): Promise<boolean> => {
  try {
    // Connect to MetaMask
    const { account, chainId } = await connectMetamask();
    
    // Check if already on Polygon network (either mainnet or testnet)
    if (chainId !== POLYGON_MAINNET_CHAIN_ID && chainId !== POLYGON_TESTNET_CHAIN_ID) {
      // Try to switch to Polygon Mainnet
      toast.info("Switching to Polygon network...");
      await switchNetwork(POLYGON_MAINNET_CHAIN_ID);
    }
    
    // Re-check the chain ID after switching
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (currentChainId !== POLYGON_MAINNET_CHAIN_ID && currentChainId !== POLYGON_TESTNET_CHAIN_ID) {
      throw new Error("Failed to switch to Polygon network");
    }
    
    // Estimate gas
    const gasEstimate = await window.ethereum.request({
      method: 'eth_estimateGas',
      params: [{
        from: account,
        to: '0xPolygonRecipientAddressHere', // This would be the recipient's address
        value: '0x' + paymentRequest.amount.toString(16) // Convert amount to hex
      }]
    });
    
    // Send transaction
    const transactionHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        to: '0xPolygonRecipientAddressHere', // This would be the recipient's address
        value: '0x' + paymentRequest.amount.toString(16), // Convert amount to hex
        gas: gasEstimate,
      }]
    });
    
    console.log(`Polygon transaction sent: ${transactionHash}`);
    
    // Create a local transaction record
    const transaction = {
      id: uuidv4(),
      type: "debit",
      amount: paymentRequest.amount,
      from: "You",
      to: paymentRequest.to,
      date: new Date(),
      status: "completed",
      description: paymentRequest.description || "Payment via Polygon",
      transactionHash
    };
    
    addTransaction(transaction);
    
    // Update user balance
    updateUserBalance(-paymentRequest.amount);
    
    toast.success("Polygon payment successful", {
      description: `Transaction hash: ${transactionHash.substring(0, 10)}...`
    });
    
    return true;
  } catch (error) {
    console.error("Error processing Polygon payment:", error);
    
    toast.error("Polygon payment failed", {
      description: error.message || "There was an error processing your payment"
    });
    
    return false;
  }
};

export const getMaticBalance = async (address: string): Promise<string> => {
  try {
    // First ensure we're on a Polygon network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== POLYGON_MAINNET_CHAIN_ID && chainId !== POLYGON_TESTNET_CHAIN_ID) {
      // Not on Polygon network, return 0
      return "0";
    }
    
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    // Convert balance from wei to MATIC (1 MATIC = 10^18 wei)
    const maticValue = parseInt(balance, 16) / 1e18;
    
    return maticValue.toFixed(4);
  } catch (error) {
    console.error("Error getting MATIC balance:", error);
    return "0";
  }
};
