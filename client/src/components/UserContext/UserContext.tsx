import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  createContext,
  type ReactNode,
} from "react";
import type { ProfileResponse, SafeUser } from "@app/shared-types";
import * as userUtils from "../../utils/user";

export type UserContextType = {
  isAuthInitialized: boolean;
  isAuthenticated: boolean;
  user: SafeUser | null;
  authToken: string | null;
  role: string;
  setAuthToken: (authToken: string) => void;
  setUser: (user: SafeUser) => void;
  setRole: (role: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  login: (user: SafeUser, token: string) => void;
  logout: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

interface DecodedJwtPayload {
  exp?: number;
}

interface InitialAuthState {
  user: SafeUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  hasCandidateSession: boolean;
}

/**
 * Decode a JWT payload from base64url format.
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if token is invalid
 */
function decodeJwtPayload(token: string): DecodedJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check whether a JWT token has expired using its exp claim.
 *
 * @param token - JWT token string
 * @returns True when the token includes an expired exp claim
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (typeof payload?.exp !== "number") return false;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Get the initial authentication state from localStorage.
 *
 * This function runs synchronously during component initialization to prevent
 * a flash of unauthenticated content on page refresh.
 *
 * @returns Object containing initial user, token, and authentication status
 */
function getInitialAuthState(): InitialAuthState {
  const storedToken = userUtils.getToken();
  const storedUser = userUtils.getUser();

  if (storedToken && storedUser && !isTokenExpired(storedToken)) {
    return {
      user: storedUser,
      authToken: storedToken,
      isAuthenticated: true,
      hasCandidateSession: true,
    };
  }

  return {
    user: null,
    authToken: null,
    isAuthenticated: false,
    hasCandidateSession: Boolean(storedToken || storedUser),
  };
}

/**
 * Provides authentication state and actions (login, logout) to descendant components through UserContext.
 *
 * Exposes role, isAuthenticated, user, authToken, their setters, and auth methods (`login`, `logout`) via context.
 *
 * @param children - Child elements that will receive the user context
 * @returns A React element rendering the UserContext provider wrapping `children`
 */
export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize auth state synchronously from localStorage to prevent flash of login form
  const [initialAuthState] = useState(getInitialAuthState);

  const [role, setRole] = useState<string>("default");
  const [user, setUser] = useState<SafeUser | null>(initialAuthState.user);
  const [authToken, setAuthToken] = useState<string | null>(
    initialAuthState.authToken,
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initialAuthState.isAuthenticated,
  );
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    async function validateStoredSession(): Promise<void> {
      // No stored session candidate, app can render auth routes immediately.
      if (!initialAuthState.hasCandidateSession) {
        if (!isCancelled) {
          setIsAuthInitialized(true);
        }
        return;
      }

      // Stored auth state was stale/invalid from startup parsing.
      if (!initialAuthState.authToken) {
        userUtils.removeToken();
        userUtils.removeUser();
        if (!isCancelled) {
          setUser(null);
          setAuthToken(null);
          setIsAuthenticated(false);
          setIsAuthInitialized(true);
        }
        return;
      }

      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${initialAuthState.authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session validation failed");
        }

        const data = (await response.json()) as ProfileResponse;
        if (!data.success) {
          throw new Error(data.message);
        }

        if (!isCancelled) {
          setUser(data.data);
          setAuthToken(initialAuthState.authToken);
          setIsAuthenticated(true);
        }
      } catch {
        userUtils.removeToken();
        userUtils.removeUser();
        if (!isCancelled) {
          setUser(null);
          setAuthToken(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!isCancelled) {
          setIsAuthInitialized(true);
        }
      }
    }

    void validateStoredSession();

    return () => {
      isCancelled = true;
    };
  }, [
    initialAuthState.authToken,
    initialAuthState.hasCandidateSession,
    setAuthToken,
    setIsAuthenticated,
    setUser,
  ]);

  const login = useCallback((user: SafeUser, authToken: string): void => {
    // update localStorage
    userUtils.saveToken(authToken);
    userUtils.saveUser(user);

    // Update context state
    setUser(user);
    setAuthToken(authToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback((): void => {
    // clear localStorage
    userUtils.removeToken();
    userUtils.removeUser();

    // clear context state
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      // getters
      isAuthInitialized,
      role,
      isAuthenticated,
      user,
      authToken,

      // setters
      setRole,
      setAuthToken,
      setUser,
      setIsAuthenticated,

      // auth methods
      logout,
      login,
    }),
    [
      role,
      isAuthInitialized,
      isAuthenticated,
      user,
      authToken,
      setRole,
      setAuthToken,
      setUser,
      setIsAuthenticated,
      logout,
      login,
    ],
  );

  return <UserContext value={contextValue}>{children}</UserContext>;
}
