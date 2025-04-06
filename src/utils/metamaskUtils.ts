
// Metamask utility functions for Web3 integration

import { PaymentRequest } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { addTransaction, updateUserBalance } from "./razorpayUtils";

export const connectMetamask = async () => {
  try {
    // Check if Ethereum provider exists
    if (!window.ethereum) {
      throw new Error("MetaMask not found. Please install the MetaMask browser extension.");
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    // If no accounts returned or access denied
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found or access denied. Please connect to MetaMask.");
    }

    const account = accounts[0];
    
    // Get network ID
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });
    
    // Get network name based on chain ID
    const networkName = getNetworkName(chainId);
    
    console.log(`Connected to MetaMask with account: ${account}`);
    console.log(`Current network: ${networkName} (${chainId})`);
    
    return { account, chainId, networkName };
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    throw error;
  }
};

export const getNetworkName = (chainId: string): string => {
  // Normalize chainId to hex in case it's a number
  const hexChainId = typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId;
  
  // Mapping of chain IDs to network names
  const networks: Record<string, string> = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
    '0x89': 'Polygon Mainnet',
    '0x13881': 'Mumbai Testnet',
    '0xa86a': 'Avalanche C-Chain',
    '0xa': 'Optimism',
    '0xa4b1': 'Arbitrum One',
    '0x38': 'BNB Smart Chain',
    '0xfa': 'Fantom Opera',
    '0x14a33': 'Base Goerli',
    '0x2105': 'Base Mainnet'
  };

  return networks[hexChainId] || `Unknown Network (${hexChainId})`;
};

export const switchNetwork = async (targetChainId: string) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }],
    });
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        // Add the network parameters
        await addNetwork(targetChainId);
        return true;
      } catch (addError) {
        console.error("Failed to add network:", addError);
        throw addError;
      }
    }
    console.error("Failed to switch network:", error);
    throw error;
  }
};

export const addNetwork = async (chainId: string) => {
  try {
    // Network parameters for different chains
    const networks: Record<string, any> = {
      '0x89': {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com/']
      },
      // Add other networks as needed
    };
    
    if (!networks[chainId]) {
      throw new Error(`Network parameters not available for chain ID: ${chainId}`);
    }
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networks[chainId]],
    });
    
    return true;
  } catch (error) {
    console.error("Failed to add network:", error);
    throw error;
  }
};

export const processMetaMaskPayment = async (paymentRequest: PaymentRequest): Promise<boolean> => {
  try {
    // Connect to MetaMask to ensure we have the latest account
    const { account } = await connectMetamask();
    
    // Estimate gas - we're making a basic transfer
    const gasEstimate = await window.ethereum.request({
      method: 'eth_estimateGas',
      params: [{
        from: account,
        to: '0xReceipientAddressHere', // In a real app, this would be the recipient's Ethereum address
        value: '0x' + paymentRequest.amount.toString(16) // Convert amount to hex
      }]
    });
    
    // Send transaction
    const transactionHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        to: '0xReceipientAddressHere', // In a real app, this would be the recipient's Ethereum address
        value: '0x' + paymentRequest.amount.toString(16), // Convert amount to hex
        gas: gasEstimate,
      }]
    });
    
    console.log(`Transaction sent: ${transactionHash}`);
    
    // Create a local transaction record
    const transaction = {
      id: uuidv4(),
      type: "debit",
      amount: paymentRequest.amount,
      from: "You",
      to: paymentRequest.to,
      date: new Date(),
      status: "completed",
      description: paymentRequest.description || "Payment via MetaMask",
      transactionHash
    };
    
    addTransaction(transaction);
    
    // Update user balance
    updateUserBalance(-paymentRequest.amount);
    
    toast.success("Payment successful", {
      description: `Transaction hash: ${transactionHash.substring(0, 10)}...`
    });
    
    return true;
  } catch (error) {
    console.error("Error processing MetaMask payment:", error);
    
    toast.error("Payment failed", {
      description: error.message || "There was an error processing your payment"
    });
    
    return false;
  }
};

export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    // Convert balance from wei to ether (1 ether = 10^18 wei)
    const etherValue = parseInt(balance, 16) / 1e18;
    
    return etherValue.toFixed(4);
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return "0";
  }
};
