import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks";

/**
 * Renders the application's top navigation bar with branding and a user menu when signed in.
 *
 * When a user is authenticated, displays the Avatar as a popover trigger; the popover shows
 * the signed-in username, a link to the profile page, and a "Sign out" button that invokes logout.
 *
 * @returns The navigation bar element containing the title and conditional user menu
 */
export function NavigationBar() {
  const { user, isAuthenticated, logout } = useUser();

  return (
    <div className="sticky top-0 z-50 w-full bg-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold hover:opacity-80">
          Auth From Scratch
        </Link>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline"
            >
              Dashboard
            </Link>

            <div className="relative">
              {/* The Trigger Button - anchored */}
              <button
                popoverTarget="user-menu"
                className="user-menu-trigger flex items-center gap-2 rounded-full transition-opacity hover:opacity-80 focus:outline-none"
              >
                <Avatar username={user.username} />
              </button>

              {/* The Popover Menu - positioned relative to the anchor */}
              <div
                id="user-menu"
                popover="auto"
                className="user-menu-popover w-48 rounded-md border border-gray-100 bg-white shadow-lg"
              >
                <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
                  Signed in as <br />
                  <span className="font-bold text-gray-900">{user.username}</span>
                </div>
                <Link
                  to="/profile"
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <svg
                    className="mr-3 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg
                    className="mr-3 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Anchor Positioning for the popover */}
      <style>{`
        .user-menu-trigger {
          anchor-name: --user-menu-anchor;
        }
        .user-menu-popover {
          position-anchor: --user-menu-anchor;
          inset: unset;
          top: anchor(bottom);
          right: anchor(right);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}

interface AvatarProps {
  username: string;
}

function Avatar({ username }: AvatarProps) {
  // Derive a consistent color from the username (same user = same color)
  const color = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (hash & 0x00ffffff).toString(16).padStart(6, "0");
  }, [username]);

  // Get initials from username
  const initials = useMemo(
    () =>
      username
        .split(" ")
        .map((name) => name.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2),
    [username],
  );

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full shadow-inner"
      style={{ backgroundColor: `#${color}` }}
    >
      <span className="font-bold text-white">{initials}</span>
    </div>
  );
}
