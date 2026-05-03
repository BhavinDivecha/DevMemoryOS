import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function Guard({ children }) {
    const token = useAuth((s) => s.token);
    return token ? children : _jsx(Navigate, { to: "/login", replace: true });
}
export function AppRouter() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(Guard, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "memories", element: _jsx(MemoriesPage, {}) }), _jsx(Route, { path: "memory-review", element: _jsx(MemoryReviewPage, {}) }), _jsx(Route, { path: "projects", element: _jsx(CrudPage, { entity: "projects" }) }), _jsx(Route, { path: "clients", element: _jsx(CrudPage, { entity: "clients" }) }), _jsx(Route, { path: "repos", element: _jsx(CrudPage, { entity: "repos" }) }), _jsx(Route, { path: "settings/api-keys", element: _jsx(ApiKeysPage, {}) }), _jsx(Route, { path: "settings/import-export", element: _jsx(ImportExportPage, {}) }), _jsx(Route, { path: "scans", element: _jsx(ScansPage, {}) })] })] }));
}
