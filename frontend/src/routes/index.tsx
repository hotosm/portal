import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthTest from "../pages/AuthTest";
import HomePage from "../pages/HomePage";
import ImageryPage from "../portal-imagery/ImageryPage";
import ProfilePage from "../pages/ProfilePage";
import DroneTMProjectsPage from "../pages/DroneTMProjectsPage";
import MappingPage from "../portal-mapping/MappingPage";
import FieldPage from "../portal-field/FieldPage";
import DataPage from "../portal-data/DataPage";
import HelpPage from "../pages/HelpPage";

// TODO not found page layout
function NotFoundPage() {
  return <div>Page not found</div>;
}

// Component to handle protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLogin, isLoading } = useAuth();

  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }

  // Redirect to home if not logged in
  if (!isLogin) {
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
}

// Main navigation routes use the same protection as ProtectedRoute
const MainNavRoute = ProtectedRoute;

export function AppRoutes() {
  return (
    <Routes>
      {/* Root route */}
      <Route path="/" element={<HomePage />} />

      {/* Locale-prefixed routes */}
      <Route path="/:locale" element={<HomePage />} />
      
      {/* TODO check if this will remain - Main navigation routes - show different CTAs when not logged in */}
      <Route
        path="/:locale/mapping"
        element={
          <MainNavRoute>
            <MappingPage />
          </MainNavRoute>
        }
      />
      <Route
        path="/:locale/imagery"
        element={
          <MainNavRoute>
            <ImageryPage />
          </MainNavRoute>
        }
      />
      <Route
        path="/:locale/field"
        element={
          <MainNavRoute>
            <FieldPage />
          </MainNavRoute>
        }
      />
      <Route
        path="/:locale/data"
        element={
          <MainNavRoute>
            <DataPage />
          </MainNavRoute>
        }
      />
      <Route
        path="/:locale/help"
        element={
          <MainNavRoute>
            <HelpPage />
          </MainNavRoute>
        }
      />

      {/* Protected user routes */}
      <Route
        path="/:locale/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:locale/drone-tm-projects"
        element={
          <ProtectedRoute>
            <DroneTMProjectsPage />
          </ProtectedRoute>
        }
      />

      {/* Testing routes */}
      <Route path="/:locale/auth-test" element={<AuthTest />} />

      {/* Fallback for invalid routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
