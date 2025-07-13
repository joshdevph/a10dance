/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { account } from "../lib/appwrite";

interface AuthContextProps {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;

}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Try restore session/user on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const user = await account.get();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    setUser(user);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await account.deleteSession("current");
    setUser(null);
    setLoading(false);
  };
  const register = async (email: string, password: string, name: string) => {
    await account.create('unique()', email, password, name);
    await login(email, password);
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for easy use
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
