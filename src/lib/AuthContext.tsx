'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { saveOrUpdateUserInDb } from './db';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        saveOrUpdateUserInDb({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          createdAt: user.metadata.creationTime || new Date().toISOString(),
          role: user.email.toLowerCase().includes('admin') || user.email === 'alexandrzet29@gmail.com' ? 'admin' : 'user',
          status: 'active',
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAdmin = currentUser?.email ? (
    currentUser.email.toLowerCase().includes('admin') || currentUser.email === 'alexandrzet29@gmail.com'
  ) : false;

  return (
    <AuthContext.Provider value={{ currentUser, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
