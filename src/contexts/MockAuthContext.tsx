import React, { createContext, useContext, useState, useEffect } from 'react';

// Define a mock user type similar to what Supabase would provide
type MockUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    avatar_url: string;
  };
};

// Define the context type
type MockAuthContextType = {
  user: MockUser | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signUp: (email?: string, password?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email?: string) => Promise<void>;
  updatePassword: (password?: string) => Promise<void>;
};

// Create a mock user
const mockUser: MockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: 'https://via.placeholder.com/150',
  }
};

// Create the context with default values
const MockAuthContext = createContext<MockAuthContextType>({
  user: mockUser, // Auto-authenticated
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
});

// Provider component
export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  // Auto-authenticate with the mock user
  const [user, setUser] = useState<MockUser | null>(mockUser);
  const [loading, setLoading] = useState(false);

  // Mock implementation of auth methods
  const signIn = async (email?: string, password?: string) => {
    console.log('Mock sign in called', email);
    setUser(mockUser);
  };

  const signUp = async (email?: string, password?: string) => {
    console.log('Mock sign up called', email);
    setUser(mockUser);
  };

  const signInWithGoogle = async () => {
    console.log('Mock sign in with Google called');
    setUser(mockUser);
  };

  const signOut = async () => {
    console.log('Mock sign out called');
    setUser(null);
  };

  const resetPassword = async (email?: string) => {
    console.log('Mock reset password called', email);
  };

  const updatePassword = async (password?: string) => {
    console.log('Mock update password called');
  };

  // Auto-authenticate on mount
  useEffect(() => {
    console.log('Auto-authenticating user');
    setUser(mockUser);
  }, []);

  // Context value
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a MockAuthProvider');
  }
  return context;
}
