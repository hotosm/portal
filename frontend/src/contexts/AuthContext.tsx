import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isLogin: boolean;
  login: () => void;
  logout: () => void;
  toggleAuth: () => void; // TODO remove
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialLoginState?: boolean;
}

export function AuthProvider({
  children,
  initialLoginState = false,
}: AuthProviderProps) {
  const [isLogin, setIsLogin] = useState<boolean>(initialLoginState);

  const login = () => setIsLogin(true);
  const logout = () => setIsLogin(false);
  const toggleAuth = () => setIsLogin((prev) => !prev);

  const value = {
    isLogin,
    login,
    logout,
    toggleAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
