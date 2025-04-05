
// metamaskUtils.ts
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
    const accounts: string[] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    
    return accounts;
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
    return chainId;
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

    return txHash as string;
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

export default {
  detectEthereum,
  connectMetamask,
  sendTransaction,
};
