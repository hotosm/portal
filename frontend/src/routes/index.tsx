import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import HomePage from "../pages/HomePage";
import ImageryPage from "../portal-imagery/ImageryPage";
import MappingPage from "../portal-mapping/MappingPage";
import FieldPage from "../portal-field/FieldPage";
import DataPage from "../portal-data/DataPage";
import HelpPage from "../pages/HelpPage";
import TestPage from "../pages/TestPage";

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
        path="/:locale/test"
        element={
          <MainNavRoute>
            <TestPage />
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

      {/* Fallback for invalid routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
