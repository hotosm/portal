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
  const { isLogin } = useAuth();

  // TODO check layout if necessary
  // menuItemId is accepted for pages that want to indicate the active main navigation item.
  // It's currently unused here but kept for typing compatibility.
  if (!isLogin) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4 text-hot-red-600">
          Access Denied
        </h1>
        <p className="text-hot-gray-600 mb-8">
          You must be logged in to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Main navigation routes use the same protection as ProtectedRoute
const MainNavRoute = ProtectedRoute;

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
            {/* TODO check if this will remain - Main navigation routes - show different CTAs when not logged in */}
            <Route
              path="/mapping"
              element={
                <MainNavRoute>
                  <MappingPage />
                </MainNavRoute>
              }
            />
            <Route
              path="/imagery"
              element={
                <MainNavRoute>
                  <ImageryPage />
                </MainNavRoute>
              }
            />
            <Route
              path="/field"
              element={
                <MainNavRoute>
                  <FieldPage />
                </MainNavRoute>
              }
            />
            <Route
              path="/data"
              element={
                <MainNavRoute>
                  <DataPage />
                </MainNavRoute>
              }
            />
            <Route
              path="/help"
              element={
                <MainNavRoute>
                  <HelpPage />
                </MainNavRoute>
              }
            />

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
