
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { toast } from 'sonner';
import { processPolygonTransaction } from '@/utils/polygonUtils';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  connectPolygonWallet: () => Promise<string>;
}

const DEFAULT_USER: UserProfile = {
  id: uuidv4(),
  name: 'Guest User',
  email: '',
  phone: '',
  balance: 5000,
  creditScore: {
    score: 750,
    maxScore: 900,
    lastUpdated: new Date(),
    paymentHistory: {
      onTimePayments: 24,
      latePayments: 1,
      missedPayments: 0,
    },
    creditUtilization: 30,
    factors: {
      positive: ['Long credit history', 'Mix of credit types'],
      negative: ['High credit utilization'],
    },
    loanInformation: {
      activeLoans: 1,
      totalLoanAmount: 120000,
      onTimeLoanPayments: 24,
    },
  },
  recentTransactions: [],
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: () => {},
  connectPolygonWallet: async () => '',
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    isAuthenticated: boolean;
    user: UserProfile | null;
    loading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setState({
          isAuthenticated: true,
          user: parsedUser,
          loading: false,
        });
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        setState({ ...state, loading: false });
      }
    } else {
      setState({ ...state, loading: false });
    }

    // Initialize Google Auth
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '188734641487-c78i5b9fh75o9ga0e10l48ueq1hdverf.apps.googleusercontent.com', // Replace with your actual Google client ID
        callback: handleGoogleResponse,
      });
    } else {
      // Load Google script if it's not already loaded
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: '188734641487-c78i5b9fh75o9ga0e10l48ueq1hdverf.apps.googleusercontent.com', // Replace with your actual Google client ID
            callback: handleGoogleResponse,
          });
        }
      };
    }
  }, []);

  const handleGoogleResponse = (response: any) => {
    // Decode JWT token from Google
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { name, email, picture } = JSON.parse(jsonPayload);
    
    // Create user profile
    const user: UserProfile = {
      ...DEFAULT_USER,
      name,
      email,
      avatar: picture,
    };
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update state
    setState({
      isAuthenticated: true,
      user,
      loading: false,
    });
    
    toast.success('Successfully logged in', {
      description: `Welcome back, ${name}!`,
    });
  };

  const loginWithGoogle = async (): Promise<void> => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      toast.error('Google authentication is not available');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
    toast.success('Successfully logged out');
  };

  const connectPolygonWallet = async (): Promise<string> => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask not detected! Please install MetaMask.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found! Please connect to MetaMask.');
      }

      // Get network ID to verify it's Polygon (Mumbai testnet or Mainnet)
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;

      // Polygon Mumbai Testnet: 0x13881, Polygon Mainnet: 0x89
      if (chainId !== '0x13881' && chainId !== '0x89') {
        try {
          // Try to switch to Polygon Mumbai testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13881' }],
          });
        } catch (switchError: any) {
          // If the network is not added to MetaMask, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
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
          }
        }
      }

      // Update user with wallet address
      if (state.user) {
        const updatedUser = {
          ...state.user,
          walletAddress: accounts[0],
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setState({
          ...state,
          user: updatedUser,
        });
      }

      toast.success('Wallet connected', {
        description: `Connected to wallet: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });

      return accounts[0];
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet', {
        description: error.message,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        loginWithGoogle,
        logout,
        connectPolygonWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
