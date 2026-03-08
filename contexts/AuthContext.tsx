import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GenerationHistory, ConnectedAccounts, SignupData } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  signup: (data: SignupData) => Promise<boolean>;
  verifyEmail: (code: string) => boolean;
  socialLogin: (provider: string) => Promise<void>;
  logout: () => void;
  deductCredit: () => void;
  updateStats: (words: number) => void;
  addToHistory: (item: GenerationHistory) => void;
  getHistory: () => GenerationHistory[];
  clearHistory: () => void;
  toggleConnection: (platform: keyof ConnectedAccounts) => void;
  isLoading: boolean;
  tempUser: SignupData | null; // For verification flow
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tempUser, setTempUser] = useState<SignupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ls_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, pass: string) => {
    // Admin / Test Account
    if (email === 'test@test.com' && pass === 'test') {
      const newUser: User = {
        email,
        firstName: 'Admin',
        lastName: 'Tester',
        name: 'Admin Tester',
        isPro: true, 
        credits: 999, 
        unlimited: true,
        connectedAccounts: { linkedin: false, twitter: false, facebook: false, instagram: false, tiktok: false },
        stats: loadStats(email)
      };
      saveUser(newUser);
      return true;
    }
    
    // Check if user exists in local storage (simulated backend)
    const storedDB = localStorage.getItem(`ls_db_${email}`);
    if (storedDB) {
        const userData = JSON.parse(storedDB);
        // In a real app, verify password hash
        if (userData.password && userData.password !== pass) return false;
        
        saveUser(userData);
        return true;
    }

    return false;
  };

  const signup = async (data: SignupData): Promise<boolean> => {
      // Simulate API Network Delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTempUser(data);
      console.log(`[LuminaScribe API] Verification code sent to ${data.email}: 123456`);
      return true;
  };

  const verifyEmail = (code: string) => {
      // Mock verification code
      if (code === '123456' && tempUser) {
          const newUser: User = {
              email: tempUser.email,
              firstName: tempUser.firstName,
              lastName: tempUser.lastName,
              birthDate: tempUser.birthDate,
              name: `${tempUser.firstName} ${tempUser.lastName}`,
              isPro: false,
              credits: 5, // Starts with 5 Free credits
              unlimited: false,
              connectedAccounts: { linkedin: false, twitter: false, facebook: false, instagram: false, tiktok: false },
              stats: { totalWords: 0, documentsCreated: 0 }
          };
          
          // Save to "DB" and session
          localStorage.setItem(`ls_db_${tempUser.email}`, JSON.stringify(newUser));
          saveUser(newUser);
          setTempUser(null);
          return true;
      }
      return false;
  };

  const socialLogin = async (provider: string) => {
    // Simulate OAuth Popup and Token Exchange delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const email = `user@${provider.toLowerCase()}.com`;
    const firstName = provider;
    const lastName = 'User';

    // Check if user already exists
    const storedDB = localStorage.getItem(`ls_db_${email}`);
    let targetUser: User;

    if (storedDB) {
        targetUser = JSON.parse(storedDB);
    } else {
        // Create new Social User
        const connected: ConnectedAccounts = { linkedin: false, twitter: false, facebook: false, instagram: false, tiktok: false };
        const key = provider.toLowerCase() as keyof ConnectedAccounts;
        if (key in connected) connected[key] = true;

        targetUser = {
            email,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            isPro: false,
            credits: 5,
            unlimited: false,
            connectedAccounts: connected,
            stats: { totalWords: 0, documentsCreated: 0 }
        };
        localStorage.setItem(`ls_db_${email}`, JSON.stringify(targetUser));
    }

    saveUser(targetUser);
  };

  const logout = () => {
    localStorage.removeItem('ls_user');
    setUser(null);
  };

  const deductCredit = () => {
    if (!user) return;
    if (user.unlimited) return;

    // Calculate new credits
    const newCredits = Math.max(0, user.credits - 1);
    
    const updatedUser = { ...user, credits: newCredits };
    
    // 1. Update State
    setUser(updatedUser);
    
    // 2. Update Session Storage
    localStorage.setItem('ls_user', JSON.stringify(updatedUser));
    
    // 3. Update "Database" Storage so it persists on logout/login
    localStorage.setItem(`ls_db_${user.email}`, JSON.stringify(updatedUser));
  };

  const updateStats = (words: number) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      stats: {
        totalWords: user.stats.totalWords + words,
        documentsCreated: user.stats.documentsCreated + 1
      }
    };
    saveUser(updatedUser);
     // Update "DB" as well
    localStorage.setItem(`ls_db_${user.email}`, JSON.stringify(updatedUser));
  };

  const toggleConnection = (platform: keyof ConnectedAccounts) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      connectedAccounts: {
        ...user.connectedAccounts,
        [platform]: !user.connectedAccounts[platform]
      }
    };
    saveUser(updatedUser);
     // Update "DB" as well
    localStorage.setItem(`ls_db_${user.email}`, JSON.stringify(updatedUser));
  };

  const saveUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ls_user', JSON.stringify(userData));
  };

  // Helper to get specific storage key for user
  const getHistoryKey = (email: string) => `ls_history_${email}`;

  const loadStats = (email: string) => {
    const historyData = localStorage.getItem(getHistoryKey(email));
    const history = historyData ? JSON.parse(historyData) : [];
    const totalWords = history.reduce((acc: number, item: any) => acc + (item.content?.split(' ').length || 0), 0);
    return {
      totalWords,
      documentsCreated: history.length
    };
  };

  // History Management Methods
  const addToHistory = (item: GenerationHistory) => {
    if (!user) return;
    const key = getHistoryKey(user.email);
    const current = getHistory();
    const updated = [item, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const getHistory = (): GenerationHistory[] => {
    if (!user) return [];
    const key = getHistoryKey(user.email);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  const clearHistory = () => {
    if (!user) return;
    const key = getHistoryKey(user.email);
    localStorage.removeItem(key);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup,
      verifyEmail,
      socialLogin,
      logout, 
      deductCredit, 
      updateStats, 
      toggleConnection,
      isLoading,
      addToHistory,
      getHistory,
      clearHistory,
      tempUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
