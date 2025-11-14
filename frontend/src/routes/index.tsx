import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthTest from "../pages/AuthTest";
import HomePage from "../pages/HomePage";
import ImageryPage from "../portal-imagery/ImageryPage";
import LandingPage from "../pages/LandingPage";
// LoginPage import removed - login is now handled by separate login-frontend service at /login
import ProfilePage from "../pages/ProfilePage";
import DroneTMProjectsPage from "../pages/DroneTMProjectsPage";
import MappingPage from "../portal-mapping/MappingPage";
import FieldPage from "../portal-field/FieldPage";
import DataPage from "../portal-data/DataPage";

function LogoutPage() {
  return (
    <div>
      <h1>Logging out...</h1>
      <p>You have been successfully logged out.</p>
    </div>
  );
}

function NotFoundPage() {
  return <div>Page not found</div>;
}

// Component to handle protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLogin } = useAuth();

  // Debug logging - remove in production
  console.log("ProtectedRoute - isLogin:", isLogin);

  if (!isLogin) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You must be logged in to access this page.
        </p>
        <p className="text-sm text-gray-500">
          Please log in using the toggle in the header for demo purposes.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Debug: Auth state is {isLogin ? "logged in" : "logged out"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Component to handle main navigation routes with different CTAs
function MainNavRoute({
  children,
  menuItemId,
}: {
  children: React.ReactNode;
  menuItemId: string;
}) {
  const { isLogin } = useAuth();

  // Debug logging - remove in production
  console.log(`MainNavRoute (${menuItemId}) - isLogin:`, isLogin);

  return isLogin ? <>{children}</> : <LandingPage menuItemId={menuItemId} />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to default locale */}
      <Route path="/" element={<HomePage />} />

      {/* All routes with locale prefix */}
      <Route
        path="/:locale/*"
        element={
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Main navigation routes - show different CTAs when not logged in */}
            <Route
              path="/mapping"
              element={
                <MainNavRoute menuItemId="mapping">
                  <MappingPage />
                </MainNavRoute>
              }
            />
            <Route
              path="/imagery"
              element={
                <MainNavRoute menuItemId="imagery">
                  <ImageryPage />
                </MainNavRoute>
              }
            />
            <Route
              path="/field"
              element={
                <MainNavRoute menuItemId="field">
                  <FieldPage />
                </MainNavRoute>
              }
            />
            <Route
              path="/data"
              element={
                <MainNavRoute menuItemId="data">
                  <DataPage />
                </MainNavRoute>
              }
            />

            {/* Authentication routes */}
            {/* /login route removed - now handled by separate login-frontend service */}
            <Route path="/logout" element={<LogoutPage />} />

            {/* Protected user routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drone-tm-projects"
              element={
                <ProtectedRoute>
                  <DroneTMProjectsPage />
                </ProtectedRoute>
              }
            />

            {/* Testing routes */}
            <Route path="/auth-test" element={<AuthTest />} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        }
      />

      {/* Fallback for invalid routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
