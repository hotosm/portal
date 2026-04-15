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

// Hanko SDK stores session state under this key with an `expiration` timestamp.
// It resets to {expiration: 0} on logout, so it's reliable as an auth signal.
function hasActiveHankoSession(): boolean {
  try {
    const state = JSON.parse(localStorage.getItem("hanko_session_state") ?? "{}");
    return Date.now() < (state.expiration ?? 0);
  } catch {
    return false;
  }
}

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
  // Only block rendering if Hanko thinks there's a valid session but we haven't
  // received the hanko-login event yet. After logout hanko_session_state.expiration
  // is 0, so this starts false and the home page renders immediately.
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(
    () => hasActiveHankoSession() && !localStorage.getItem(AUTH_CACHE_KEY)
  );

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

    // Fallback: if Hanko session appeared valid but hanko-login never fires
    // (e.g. network error, token actually expired), stop blocking after 2s.
    const loadingTimer = setTimeout(() => setIsAuthLoading(false), 2000);

    // hanko-session-created fires as soon as a Hanko session is established —
    // before hanko-login fires. Using it to set isAuthLoading = true suppresses
    // the homepage flash during active login form submission.
    const handleSessionCreated = () => setIsAuthLoading(true);

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
      setIsAuthLoading(false);
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
    document.addEventListener("hanko-session-created", handleSessionCreated);
    document.addEventListener("hanko-login", handleLogin);
    document.addEventListener("logout", handleLogout);
    document.addEventListener("osm-connected", handleOsmConnected);

    // Cleanup
    return () => {
      clearTimeout(loadingTimer);
      document.removeEventListener("hanko-session-created", handleSessionCreated);
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
