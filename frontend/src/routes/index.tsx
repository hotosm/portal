import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import HomePage from "../pages/HomePage";
import WelcomePage from "../pages/WelcomePage";
import ImageryPage from "../portal-imagery/ImageryPage";
import MappingPage from "../portal-mapping/MappingPage";
import FieldPage from "../portal-field/FieldPage";
import DataPage from "../portal-data/DataPage";
import TestPage from "../pages/TestPage";
import NotFoundPage from "../pages/NotFoundPage";
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
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>
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

      <Route path="/:locale/privacy-policy" element={<PrivacyPolicyPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
