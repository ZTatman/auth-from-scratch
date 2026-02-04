// Types
import type { SafeUser } from "@app/shared-types";

// Components
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

/**
 * Props for the ProfileCard component.
 */
interface ProfileCardProps {
  /** The user data to display, or null if no user is available */
  user: SafeUser | null;
  /** Callback function triggered when user clicks sign out */
  onLogout: () => void;
}

/**
 * ProfileCard component that displays user information in a styled card.
 *
 * Shows the user's username, unique ID, and account creation date in a clean
 * card layout. Includes a sign out button for user logout functionality.
 *
 * @param user - The user object containing username, ID, and creation date
 * @param onLogout - Function to call when sign out button is clicked
 * @returns JSX element rendering the profile information card
 */
export function ProfileCard({ user, onLogout }: ProfileCardProps) {
  return (
    <Card className="border-border/60 w-full border text-left">
      <CardHeader>
        <CardTitle className="text-2xl">Account Details</CardTitle>
        <CardDescription>
          Verified account information from the server.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
          <dl className="grid gap-4">
            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm font-medium">
                Username
              </dt>
              <dd className="text-foreground text-lg">{user.username}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm font-medium">
                User ID
              </dt>
              <dd className="text-muted-foreground font-mono text-sm">
                {user.id}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-muted-foreground text-sm font-medium">
                Member Since
              </dt>
              <dd className="text-foreground text-lg">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-muted-foreground">No user data available.</p>
        )}
      </CardContent>
      <CardFooter className="border-border border-t">
        <Button variant="destructive" className="w-full" onClick={onLogout}>
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
}
