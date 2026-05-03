import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
const nav = [
    {
        title: "Workspace",
        items: [
            ["Dashboard", "/dashboard"],
            ["Memories", "/memories"],
            ["Memory Review", "/memory-review"],
            ["Scans", "/scans"],
            ["Projects", "/projects"],
            ["Clients", "/clients"],
            ["Repos", "/repos"]
        ]
    },
    {
        title: "Settings",
        items: [
            ["API Keys", "/settings/api-keys"],
            ["Import/Export", "/settings/import-export"]
        ]
    }
];
const titles = {
    "/dashboard": "Dashboard",
    "/memories": "Memories",
    "/memory-review": "Memory Review",
    "/scans": "Scans",
    "/projects": "Projects",
    "/clients": "Clients",
    "/repos": "Repos",
    "/settings/api-keys": "API Keys",
    "/settings/import-export": "Import & Export"
};
export function Layout() {
    const [open, setOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const setToken = useAuth((s) => s.setToken);
    const location = useLocation();
    const navigate = useNavigate();
    async function handleLogout() {
        if (loggingOut)
            return;
        setLoggingOut(true);
        try {
            await api.post("/auth/logout", {});
        }
        catch {
            // client token cleanup is still required if API is unavailable
        }
        finally {
            setToken(null);
            setLoggingOut(false);
            navigate("/login");
        }
    }
    const SidebarContent = (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-6", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.2em] text-cyan-300", children: "Phase 4" }), _jsx("h1", { className: "font-semibold text-xl", children: "Super Memory" }), _jsx("p", { className: "text-xs text-slate-300 mt-1", children: "Long-term context with quality controls." })] }), _jsx("div", { className: "space-y-5", children: nav.map((group) => (_jsxs("div", { children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-2", children: group.title }), _jsx("nav", { className: "space-y-1", children: group.items.map(([label, href]) => (_jsx(NavLink, { to: href, onClick: () => setOpen(false), className: ({ isActive }) => `block rounded-lg px-3 py-2 text-sm transition ${isActive
                                    ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                                    : "text-slate-200 hover:bg-slate-800/80 hover:text-white border border-transparent"}`, children: label }, href))) })] }, group.title))) }), _jsxs("div", { className: "mt-6 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3", children: [_jsx("p", { className: "text-[11px] font-medium text-amber-200 mb-1", children: "Security Notice" }), _jsx("p", { className: "text-[11px] leading-5 text-amber-100/90", children: "Do not store passwords, private keys, API tokens, or sensitive customer data." })] })] }));
    return (_jsxs("div", { className: "min-h-screen grid grid-cols-1 md:grid-cols-[280px_1fr]", children: [_jsx("aside", { className: "hidden md:block bg-gradient-to-b from-slate-950 to-slate-900 text-white p-5 border-r border-slate-800", children: SidebarContent }), open && _jsx("button", { className: "fixed inset-0 z-40 bg-black/50 md:hidden", onClick: () => setOpen(false), "aria-label": "Close navigation" }), _jsxs("aside", { className: `fixed top-0 left-0 z-50 h-full w-[280px] bg-gradient-to-b from-slate-950 to-slate-900 text-white p-5 border-r border-slate-800 transform transition-transform md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("p", { className: "text-sm font-medium text-slate-200", children: "Menu" }), _jsx("button", { className: "text-slate-300 hover:text-white", onClick: () => setOpen(false), "aria-label": "Close menu", children: "\u2715" })] }), SidebarContent] }), _jsxs("main", { className: "p-4 md:p-6", children: [_jsxs("div", { className: "card card-pad mb-4 flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-500", children: "Super Memory Workspace" }), _jsx("h2", { className: "text-lg font-semibold", children: titles[location.pathname] || "Workspace" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn-secondary", onClick: () => setOpen(true), children: "Menu" }), _jsx("button", { className: "btn-secondary", onClick: handleLogout, disabled: loggingOut, children: loggingOut ? "Logging out..." : "Logout" })] })] }), _jsx(Outlet, {})] })] }));
}
