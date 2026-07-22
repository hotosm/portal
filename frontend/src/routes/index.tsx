import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import HomePage from "../pages/HomePage";
import WelcomePage from "../pages/WelcomePage";
import ImageryPage from "../portal-imagery/ImageryPage";
import MappingPage from "../portal-mapping/MappingPage";
import FieldPage from "../portal-field/FieldPage";
import DataPage from "../portal-data/DataPage";
import HelpPage from "../pages/HelpPage";
import TestPage from "../pages/TestPage";
import NotFoundPage from "../pages/NotFoundPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import PlanPage from "../portal-plans/PlanPage";
import AddPlanPage from "../portal-plans/AddPlanPage";
import EditPlanPage from "../portal-plans/EditPlanPage";
import MyPlanPage from "../portal-plans/MyPlanPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";

// Component to handle protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLogin, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (!isLogin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Component to handle routes restricted to admin users.
// Admin status is verified against the backend (/api/test/me, gated by
// ADMIN_EMAILS via AdminUser) rather than trusted client-side.
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLogin, isAuthLoading } = useAuth();

  const { isLoading: isAdminCheckLoading, isError: isNotAdmin } = useQuery({
    queryKey: ["admin-check"],
    queryFn: async () => {
      const response = await fetch("/api/test/me", { credentials: "include" });
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      return response.json();
    },
    enabled: isLogin,
    retry: false,
  });

  if (isAuthLoading || (isLogin && isAdminCheckLoading)) {
    return null;
  }

  if (!isLogin) {
    return <Navigate to="/" replace />;
  }

  if (isNotAdmin) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root route */}
      <Route path="/" element={<HomePage />} />

      {/* Locale-prefixed routes */}
      <Route path="/:locale" element={<HomePage />} />

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
          <ProtectedRoute>
            <MappingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:locale/imagery"
        element={
          <ProtectedRoute>
            <ImageryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:locale/field"
        element={
          <ProtectedRoute>
            <FieldPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:locale/data"
        element={
          <ProtectedRoute>
            <DataPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/:locale/test"
        element={
          <AdminRoute>
            <TestPage />
          </AdminRoute>
        }
      />
      <Route path="/:locale/plan">
        <Route
          index
          element={
            <ProtectedRoute>
              <PlanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="new"
          element={
            <ProtectedRoute>
              <AddPlanPage />
            </ProtectedRoute>
          }
        />
        <Route path=":planId">
          <Route
            index
            element={<MyPlanPage />}
          />
          <Route
            path="edit"
            element={
              <ProtectedRoute>
                <EditPlanPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
      <Route
        path="/:locale/help"
        element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        }
      />

      <Route path="/:locale/privacy-policy" element={<PrivacyPolicyPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
