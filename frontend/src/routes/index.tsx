import { Route, Routes } from "react-router-dom";
import { HealthCheck } from "../components/HealthCheck";
import ProfilePage from "../pages/ProfilePage";
import HankoTest from "../pages/HankoTest";
import HomePage from "../pages/HomePage";

// Placeholder components for now
function MappingPage() {
  return <div>Mapping page coming soon</div>;
}

function ImageryPage() {
  return <div>Imagery page coming soon</div>;
}

function FieldPage() {
  return <div>Field page coming soon</div>;
}

function DataPage() {
  return <div>Data page coming soon</div>;
}

function LoginPage() {
  return (
    <div>
      <HealthCheck />
    </div>
  );
}

function StartMappingPage() {
  return <div>Start Mapping page coming soon</div>;
}

function ProjectsPage() {
  return <div>My Projects page coming soon</div>;
}

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

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mapping" element={<MappingPage />} />
      <Route path="/imagery" element={<ImageryPage />} />
      <Route path="/field" element={<FieldPage />} />
      <Route path="/data" element={<DataPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/start" element={<StartMappingPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/hanko-test" element={<HankoTest />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
