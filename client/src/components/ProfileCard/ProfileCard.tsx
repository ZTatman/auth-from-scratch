// Types
import type { SafeUser } from "@app/shared-types";

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
  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center text-gray-500">No user data available</div>
      </div>
    );
  }

  const createdDate = new Date(user.createAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Profile</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <p className="mt-1 text-lg text-gray-900">{user.username}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <p className="mt-1 font-mono text-sm text-gray-600">{user.id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Member Since
          </label>
          <p className="mt-1 text-lg text-gray-900">{createdDate}</p>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <button
          onClick={onLogout}
          className="w-full rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
