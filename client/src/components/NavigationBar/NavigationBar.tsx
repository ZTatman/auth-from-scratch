import { useMemo, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks";

// Components
import { Button } from "../ui/button";

/**
 * Renders application's top navigation bar with branding and a user menu when signed in.
 *
 * When a user is authenticated, displays Avatar as a popover trigger; popover shows
 * signed-in username, a link to profile page, and a "Sign out" button that invokes logout.
 *
 * @returns The navigation bar element containing the title and conditional user menu
 */
export function NavigationBar(): ReactElement {
  const { user, isAuthenticated, logout } = useUser();

  return (
    <div className="bg-background/90 sticky top-0 z-50 w-full p-4 shadow-sm backdrop-blur">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-foreground text-2xl font-bold hover:opacity-80"
        >
          Auth From Scratch
        </Link>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground text-sm font-medium hover:underline"
            >
              Home
            </Link>
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground text-sm font-medium hover:underline"
            >
              Auth
            </Link>

            <div className="relative">
              {/* The Trigger Button - anchored */}
              <Button
                popoverTarget="user-menu"
                variant="ghost"
                size="icon-sm"
                className="user-menu-trigger flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
              >
                <Avatar username={user.username} />
              </Button>

              {/* The Popover Menu - positioned relative to the anchor */}
              <div
                id="user-menu"
                popover="auto"
                className="user-menu-popover bg-popover text-popover-foreground w-48 rounded-md shadow-lg"
              >
                <div className="border-border text-muted-foreground border-b px-4 py-2 text-xs">
                  Signed in as <br />
                  <span className="text-foreground font-bold">
                    {user.username}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="text-foreground hover:bg-muted flex w-full items-center px-4 py-2 text-sm transition-colors"
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
                <Button
                  onClick={() => logout()}
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 w-full justify-start px-4 text-sm"
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
                </Button>
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

/**
 * Renders user initials in a color derived from the username.
 *
 * @param username - Authenticated user's display name.
 * @returns Avatar circle containing initials.
 */
function Avatar({ username }: AvatarProps): ReactElement {
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
