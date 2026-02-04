import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";

// Hooks
import { useDeleteAccount, useGetProfile, useUser } from "./hooks";

// Components
import { NavigationBar } from "./components/NavigationBar/NavigationBar";
import { AuthPage } from "./components/AuthPage";
import { ProfileCard } from "./components/ProfileCard/ProfileCard";
import { UserProvider } from "./components/UserContext/UserContext";
import { Button } from "./components/ui/button";

// Styles
import "./App.css";

/**
 * Layout component that wraps pages with the navigation bar and common styling.
 *
 * @param children - Child elements to render within the layout
 * @returns The page layout with navigation bar
 */
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-4 gap-y-8 bg-background">
      <NavigationBar />
      {children}
    </div>
  );
}

/**
 * Renders the home page for authenticated users.
 *
 * Displays a welcome message with the user's name.
 *
 * @returns JSX for the home page
 */
function HomePage() {
  const { user } = useUser();

  return (
    <PageLayout>
      <div className="mt-8 flex w-full max-w-2xl flex-col items-center gap-6 px-4">
        <h2 className="text-3xl font-bold text-foreground">
          Welcome{user ? `, ${user.username}` : ""}!
        </h2>
        <p className="text-center text-muted-foreground">
          You are successfully logged in. Use the avatar menu in the top right
          to access your profile or sign out.
        </p>
      </div>
    </PageLayout>
  );
}

/**
 * Renders the profile page for authenticated users.
 *
 * Fetches and displays the user's profile information from the protected API endpoint.
 * Includes loading states, error handling, and the profile card component.
 *
 * Note: We intentionally fetch the profile from the server rather than using the cached
 * user data from context. This serves as server-side token validation to ensure the
 * token is still valid and the user account still exists, providing an extra layer of
 * security for protected routes.
 *
 * @returns JSX for the profile page or loading/error states
 */
function ProfilePage() {
  const { authToken, logout } = useUser();
  const navigate = useNavigate();
  const {
    data: profileData,
    isLoading,
    error,
  } = useGetProfile(authToken || undefined);
  const deleteAccountMutation = useDeleteAccount();

  // Handle token-related errors by logging out
  useEffect(() => {
    if (error) {
      const errorMessage = error.message?.toLowerCase() || "";
      if (
        errorMessage.includes("token") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("access")
      ) {
        logout();
      }
    }
  }, [error, logout]);

  const profile = profileData?.success ? profileData.data : null;
  const deleteError = deleteAccountMutation.data?.success
    ? null
    : deleteAccountMutation.data?.message || null;
  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="w-full rounded-xl border border-border/60 bg-card p-6 text-center text-muted-foreground shadow-sm">
        Loading profile...
      </div>
    );
  } else if (error) {
    content = (
      <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <div className="text-destructive">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  } else {
    content = (
      <ProfileCard
        user={profile}
        onLogout={() => {
          logout();
          toast.success("Signed out");
        }}
        onDeleteAccount={async () => {
          const result = await deleteAccountMutation.mutateAsync();
          if (result.success) {
            logout();
            navigate("/auth", { replace: true });
            return true;
          }
          return false;
        }}
        isDeleting={deleteAccountMutation.isPending}
        deleteError={deleteError}
      />
    );
  }

  return (
    <PageLayout>
      <div className="mt-8 flex w-full max-w-2xl flex-col items-center gap-6 px-4">
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-bold text-foreground">Profile</h2>
          <p className="mt-2 text-muted-foreground">
            View your account details and session status.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Auth
          </Link>
        </div>
        {content}
      </div>
    </PageLayout>
  );
}

/**
 * Wrapper component that handles routing based on authentication state.
 *
 * Renders routes for authenticated users (home and profile) or redirects
 * unauthenticated users to the auth page.
 *
 * @returns The router with conditional routes based on auth state
 */
function AppRoutes() {
  const { isAuthenticated } = useUser();

  return (
    <Routes>
      {/* Public route (can be visited when authenticated to see success state) */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? <HomePage /> : <Navigate to="/auth" replace />
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" replace />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
