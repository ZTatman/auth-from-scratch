import { useCallback, useMemo, useState, createContext, type ReactNode } from "react";
import type { SafeUser } from "@app/shared-types";
import * as userUtils from "../../utils/user";

export type UserContextType = {
  isAuthenticated: boolean;
  user: SafeUser | null;
  authToken: string | null;
  role: string;
  setAuthToken: (authToken: string) => void;
  setUser: (user: SafeUser) => void;
  setRole: (role: string) => void;
  login: (user: SafeUser, token: string) => void;
  logout: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

/**
 * Get the initial authentication state from localStorage.
 *
 * This function runs synchronously during component initialization to prevent
 * a flash of unauthenticated content on page refresh.
 *
 * @returns Object containing initial user, token, and authentication status
 */
function getInitialAuthState(): {
  user: SafeUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
} {
  const storedToken = userUtils.getToken();
  const storedUser = userUtils.getUser();

  if (storedToken && storedUser) {
    return {
      user: storedUser,
      authToken: storedToken,
      isAuthenticated: true,
    };
  }

  return {
    user: null,
    authToken: null,
    isAuthenticated: false,
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
