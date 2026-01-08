import { useState, useEffect, createContext, type ReactNode } from "react";
import { type User } from "../../types";
import * as userUtils from "../../utils/user";

export type UserContextType = {
  isAuthenticated: boolean;
  user: User | null;
  authToken: string | null;
  role: string;
  setAuthToken: (authToken: string) => void;
  setUser: (user: User) => void;
  setRole: (role: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string>("default");
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // get token and user from localStorage
    const storedToken = userUtils.getToken();
    const storedUser = userUtils.getUser();

    // if token and user are found, set them in the context
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (user: User, authToken: string): void => {
    // update localStorage
    userUtils.saveToken(authToken);
    userUtils.saveUser(user);

    // Update context state
    setUser(user);
    setAuthToken(authToken);
    setIsAuthenticated(true);
  };

  const logout = (): void => {
    // clear localStorage
    userUtils.removeToken();
    userUtils.removeUser();

    // clear context state
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  const contextValue = {
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
  };

  return <UserContext value={contextValue}>{children}</UserContext>;
}
