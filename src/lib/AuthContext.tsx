import React, { createContext, useContext, useState, useEffect } from "react";
import { User, getCurrentUser, login as doLogin, register as doRegister, logout as doLogout } from "./mockData";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const login = (email: string, password: string) => {
    const result = doLogin(email, password);
    if (result.success && result.user) setUser(result.user);
    return result;
  };

  const register = (name: string, email: string, password: string) => {
    const result = doRegister(name, email, password);
    if (result.success && result.user) {
      doLogin(email, password);
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    doLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
