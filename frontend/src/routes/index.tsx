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
import NotFoundPage from "../pages/NotFoundPage";
import PlanPage from "../portal-plans/PlanPage";
import AddPlanPage from "../portal-plans/AddPlanPage";
import EditPlanPage from "../portal-plans/EditPlanPage";
import MyPlanPage from "../portal-plans/MyPlanPage";

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
      <Route path="/:locale/plan">
        <Route
          index
          element={
            <MainNavRoute>
              <PlanPage />
            </MainNavRoute>
          }
        />
        <Route
          path="new"
          element={
            <MainNavRoute>
              <AddPlanPage />
            </MainNavRoute>
          }
        />
        <Route path=":planId">
          <Route
            index
            element={
              <MainNavRoute>
                <MyPlanPage />
              </MainNavRoute>
            }
          />
          <Route
            path="edit"
            element={
              <MainNavRoute>
                <EditPlanPage />
              </MainNavRoute>
            }
          />
        </Route>
      </Route>
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
