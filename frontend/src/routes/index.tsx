import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import HomePage from "../pages/HomePage";
import WelcomePage from "../pages/WelcomePage";
import ImageryPage from "../portal-imagery/ImageryPage";
import MappingPage from "../portal-mapping/MappingPage";
import FieldPage from "../portal-field/FieldPage";
import DataPage from "../portal-data/DataPage";
import HelpPage from "../pages/HelpPage";
import TestPage from "../pages/TestPage";

function NotFoundPage() {
  return <div>Page not found</div>;
}

// Component to handle protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLogin } = useAuth();

  if (!isLogin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const MainNavRoute = ProtectedRoute;

function HomeRoute() {
  const { isLogin, isAuthLoading } = useAuth();
  const { locale } = useParams<{ locale?: string }>();

  if (isAuthLoading) {
    return null;
  }

  if (isLogin) {
    return <Navigate to={locale ? `/${locale}/welcome` : "/welcome"} replace />;
  }

  return <HomePage />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root route */}
      <Route path="/" element={<HomeRoute />} />

      {/* Locale-prefixed routes */}
      <Route path="/:locale" element={<HomeRoute />} />

      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:locale/welcome"
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />

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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
