import { use } from "react";

// Components
import {
  UserContext,
  type UserContextType,
} from "../components/UserContext/UserContext";

/**
 * Custom hook to access the UserContext
 * @returns {UserContextType} The UserContextType
 */
export default function useUser(): UserContextType {
  const context = use(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
