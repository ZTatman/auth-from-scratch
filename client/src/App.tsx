import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Hooks
import { useUser, useGetProfile } from "./hooks";

// Components
import { NavigationBar } from "./components/NavigationBar/NavigationBar";
import { AuthPage } from "./components/AuthPage";
import { ProfileCard } from "./components/ProfileCard/ProfileCard";
import { UserProvider } from "./components/UserContext/UserContext";

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
    <div className="flex min-h-screen flex-col items-center justify-start gap-4 gap-y-8 bg-gray-100">
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
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome{user ? `, ${user.username}` : ""}!
        </h2>
        <p className="text-center text-gray-600">
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
  const {
    data: profileData,
    isLoading,
    error,
  } = useGetProfile(authToken || undefined);

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

  if (isLoading) {
    return (
      <PageLayout>
        <div className="mt-8 text-lg text-gray-600">Loading profile...</div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="text-red-600">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mt-8 w-full max-w-md">
        <ProfileCard user={profile} onLogout={logout} />
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

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
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
