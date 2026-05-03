import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../lib/auth";
import { LoginPage, RegisterPage } from "../features/auth/AuthPages";
import { DashboardPage } from "../features/memories/DashboardPage";
import { MemoriesPage } from "../features/memories/MemoriesPage";
import { CrudPage } from "../features/shared/CrudPage";
import { ApiKeysPage } from "../features/settings/ApiKeysPage";
import { ImportExportPage } from "../features/settings/ImportExportPage";
import { ScansPage } from "../features/scans/ScansPage";
import { MemoryReviewPage } from "../features/memories/MemoryReviewPage";

function Guard({ children }: { children: JSX.Element }) {
  const token = useAuth((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="memories" element={<MemoriesPage />} />
        <Route path="memory-review" element={<MemoryReviewPage />} />
        <Route path="projects" element={<CrudPage entity="projects" />} />
        <Route path="clients" element={<CrudPage entity="clients" />} />
        <Route path="repos" element={<CrudPage entity="repos" />} />
        <Route path="settings/api-keys" element={<ApiKeysPage />} />
        <Route path="settings/import-export" element={<ImportExportPage />} />
        <Route path="scans" element={<ScansPage />} />
      </Route>
    </Routes>
  );
}
