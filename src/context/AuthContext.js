// Miami Beach Resort - Authentication Context

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

// Default users (same as web app)
const DEFAULT_USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin', role: 'admin' },
  { id: 2, username: 'frontdesk', password: 'fd123', name: 'Front Desk', role: 'front_desk' },
  { id: 3, username: 'accounting', password: 'acc123', name: 'Accounting', role: 'accounting' },
  { id: 4, username: 'hkmanager', password: 'hkm123', name: 'HK Manager', role: 'hk_manager' },
  { id: 5, username: 'hkteam', password: 'team123', name: 'HK Team', role: 'hk_team' },
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored session on app start
  useEffect(() => {
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('miami_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    // Check against default users
    const foundUser = DEFAULT_USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const userData = {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
      };
      
      setUser(userData);
      await AsyncStorage.setItem('miami_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('miami_user');
  };

  // Role-based access control
  const canAccessTab = (tabId) => {
    if (!user) return false;
    
    const roleAccess = {
      admin: ['today', 'calendar', 'bookings', 'housekeeping', 'accounting', 'search'],
      front_desk: ['today', 'calendar', 'bookings', 'search'],
      accounting: ['today', 'bookings', 'accounting'],
      hk_manager: ['today', 'housekeeping'],
      hk_team: ['housekeeping'],
    };

    return roleAccess[user.role]?.includes(tabId) || false;
  };

  // Check if user can edit bookings
  const canEditBookings = () => {
    if (!user) return false;
    return ['admin', 'front_desk'].includes(user.role);
  };

  // Check if user can view financial data
  const canViewFinancials = () => {
    if (!user) return false;
    return ['admin', 'accounting', 'front_desk'].includes(user.role);
  };

  // Check if user is housekeeping role
  const isHousekeeping = () => {
    if (!user) return false;
    return ['hk_manager', 'hk_team'].includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      canAccessTab,
      canEditBookings,
      canViewFinancials,
      isHousekeeping,
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

export default AuthContext;
