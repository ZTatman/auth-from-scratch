// Types
import type { SafeUser } from "@app/shared-types";
import { useState } from "react";

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
  /** Callback function triggered when user confirms account deletion */
  onDeleteAccount: () => Promise<boolean>;
  /** Whether account deletion is currently in progress */
  isDeleting: boolean;
  /** Error message shown when deletion fails */
  deleteError?: string | null;
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
export function ProfileCard({
  user,
  onLogout,
  onDeleteAccount,
  isDeleting,
  deleteError,
}: ProfileCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirmDelete = async () => {
    const success = await onDeleteAccount();
    if (success) {
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="w-full space-y-4">
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
          <Button variant="secondary" className="w-full" onClick={onLogout}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-border/60 w-full border text-left">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deleting your account removes your profile and invalidates your
            session. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deleteError ? (
            <p className="text-destructive text-sm">{deleteError}</p>
          ) : null}
        </CardContent>
        <CardFooter className="border-border border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setIsDialogOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </CardFooter>
      </Card>

      {isDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-md">
            <h3
              id="delete-account-title"
              className="text-foreground text-lg font-semibold"
            >
              Delete account?
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              This action permanently removes your account and ends your
              session. This cannot be undone.
            </p>
            {deleteError ? (
              <p className="text-destructive mt-3 text-sm">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
