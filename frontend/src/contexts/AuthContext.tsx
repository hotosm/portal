import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface HankoUser {
  id: string;
  email: string | null;
  username: string | null;
  emailVerified: boolean;
  avatarUrl?: string;
}

interface OSMConnection {
  osm_username: string;
  osm_user_id: number;
  connected: boolean;
}

interface AuthContextType {
  user: HankoUser | null;
  osmConnection: OSMConnection | null;
  isLogin: boolean; // Computed from user !== null
  isAuthLoading: boolean; // True while waiting for web component to signal auth state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_CACHE_KEY = "hotosm-auth-user";

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<HankoUser | null>(() => {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      return cached ? (JSON.parse(cached) as HankoUser) : null;
    } catch {
      return null;
    }
  });
  const [osmConnection, setOsmConnection] = useState<OSMConnection | null>(
    null
  );
  // Start loading if there's no cached user — wait for the web component to signal auth state
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(AUTH_CACHE_KEY);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // Check initial OSM connection status
    const checkOsmStatus = async () => {
      try {
        const response = await fetch("/api/auth/osm/status", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.connected) {
            setOsmConnection({
              osm_username: data.osm_username,
              osm_user_id: data.osm_user_id,
              connected: true,
            });
          }
        }
      } catch (error) {
        console.error("AuthContext: Failed to check OSM status", error);
      }
    };

    // Check OSM status on mount
    checkOsmStatus();

    // Fallback: stop loading after 500ms even if no auth event fires (user is not logged in)
    const loadingTimer = setTimeout(() => setIsAuthLoading(false), 500);

    // Listen to hanko-login event from web component
    const handleLogin = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsAuthLoading(false);
      setUser(customEvent.detail.user);
      try {
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(customEvent.detail.user));
      } catch {}
      // Re-check OSM status after login
      checkOsmStatus();
    };

    // Listen to logout event from web component
    const handleLogout = () => {
      setUser(null);
      setOsmConnection(null);
      try {
        localStorage.removeItem(AUTH_CACHE_KEY);
      } catch {}
    };

    // Listen to osm-connected event from web component
    const handleOsmConnected = (event: Event) => {
      const customEvent = event as CustomEvent;
      setOsmConnection(customEvent.detail.osmData);
    };

    // Add event listeners
    document.addEventListener("hanko-login", handleLogin);
    document.addEventListener("logout", handleLogout);
    document.addEventListener("osm-connected", handleOsmConnected);

    // Cleanup
    return () => {
      clearTimeout(loadingTimer);
      document.removeEventListener("hanko-login", handleLogin);
      document.removeEventListener("logout", handleLogout);
      document.removeEventListener("osm-connected", handleOsmConnected);
    };
  }, []);

  const value = {
    user,
    osmConnection,
    isLogin: user !== null,
    isAuthLoading,
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
