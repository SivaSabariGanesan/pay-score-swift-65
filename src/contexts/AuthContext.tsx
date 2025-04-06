
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<string>;
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
  connectWallet: async () => '',
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

  // Update the client ID and configure additional parameters like redirects
  const GOOGLE_CLIENT_ID = '121411899077-38p480klc54p8ia84lqm9v2r3c409j7l.apps.googleusercontent.com';
  
  // Define the redirect URI based on the environment
  const getRedirectUri = () => {
    // For Android app using Capacitor
    if (window.location.href.includes('capacitor://')) {
      return 'capacitor://localhost';
    }
    // For deployed web version
    if (window.location.hostname === 'transpay-five.vercel.app') {
      return 'https://transpay-five.vercel.app';
    }
    // For local development
    return window.location.origin;
  };

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
  }, []);

  useEffect(() => {
    // Initialize Google Auth
    const initGoogleAuth = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            ux_mode: 'popup',
            login_uri: getRedirectUri(),
          });
          console.log("Google Auth initialized successfully with redirect URI:", getRedirectUri());
        } catch (error) {
          console.error("Failed to initialize Google Auth:", error);
        }
      }
    };
    
    // Check if Google script is already loaded
    if (window.google && window.google.accounts) {
      initGoogleAuth();
    } else {
      // Load Google script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Auth script loaded");
        initGoogleAuth();
      };
      script.onerror = (error) => {
        console.error("Error loading Google Auth script:", error);
      };
      document.body.appendChild(script);
    }

    return () => {
      // Clean up Google Auth if needed
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.error("Error cancelling Google Auth:", error);
        }
      }
    };
  }, []);

  const handleGoogleResponse = (response: any) => {
    try {
      console.log("Received Google response:", response);
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
    } catch (error) {
      console.error("Failed to process Google response:", error);
      toast.error('Failed to log in with Google');
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Try to display the One Tap UI manually
            window.google.accounts.id.renderButton(
              document.getElementById('google-login-button') || document.createElement('div'),
              { theme: 'outline', size: 'large', shape: 'pill' }
            );
          }
        });
      } catch (error) {
        console.error("Failed to prompt Google login:", error);
        toast.error('Google authentication is not available', {
          description: 'Please try again later or use another login method'
        });
      }
    } else {
      toast.error('Google authentication is not available');
      console.error('Google API not loaded');
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

  const connectWallet = async (): Promise<string> => {
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

      // Get current network
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;

      console.log(`Connected to chain ID: ${chainId}`);

      // Update user with wallet address
      if (state.user) {
        const updatedUser = {
          ...state.user,
          walletAddress: accounts[0],
          chainId: chainId,
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
        connectWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
