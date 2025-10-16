import { Routes, Route } from "react-router-dom";
import { HealthCheck } from "../components/HealthCheck";
import HomePage from "./HomePage";

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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
