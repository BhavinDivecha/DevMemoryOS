import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
export function DashboardPage() {
    const memories = useQuery({ queryKey: ["memories"], queryFn: async () => (await api.get("/memories")).data.data });
    const projects = useQuery({ queryKey: ["projects"], queryFn: async () => (await api.get("/projects")).data.data });
    const clients = useQuery({ queryKey: ["clients"], queryFn: async () => (await api.get("/clients")).data.data });
    const repos = useQuery({ queryKey: ["repos"], queryFn: async () => (await api.get("/repos")).data.data });
    const data = memories.data || [];
    const cards = [
        ["Total memories", data.length],
        ["Active memories", data.filter((m) => m.status === "active").length],
        ["Pending memories", data.filter((m) => m.status === "pending").length],
        ["Projects", projects.data?.length || 0],
        ["Clients", clients.data?.length || 0],
        ["Repos", repos.data?.length || 0]
    ];
    const recent = [...data].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 6);
    const important = [...data].sort((a, b) => b.importance - a.importance).slice(0, 6);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Dashboard" }), _jsx("p", { className: "page-subtitle", children: "Quick overview of memory quality, activity, and workspace entities." })] }), _jsx("div", { className: "grid grid-cols-2 xl:grid-cols-6 gap-3", children: cards.map(([title, value]) => (_jsxs("div", { className: "card card-pad", children: [_jsx("p", { className: "text-xs text-slate-500", children: title }), _jsx("p", { className: "text-2xl font-semibold mt-1", children: value })] }, String(title)))) }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-4", children: [_jsxs("section", { className: "card card-pad", children: [_jsx("h2", { className: "font-semibold", children: "Recent memories" }), _jsxs("div", { className: "mt-3 space-y-2", children: [recent.map((m) => (_jsxs("div", { className: "rounded-lg border border-slate-200 p-3", children: [_jsx("p", { className: "font-medium text-sm", children: m.title }), _jsx("p", { className: "text-xs text-slate-600 mt-1 line-clamp-2", children: m.content })] }, m.id))), !recent.length && _jsx("p", { className: "text-sm text-slate-500", children: "No memories yet." })] })] }), _jsxs("section", { className: "card card-pad", children: [_jsx("h2", { className: "font-semibold", children: "Important memories" }), _jsxs("div", { className: "mt-3 space-y-2", children: [important.map((m) => (_jsxs("div", { className: "rounded-lg border border-slate-200 p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "font-medium text-sm", children: m.title }), _jsxs("span", { className: "badge bg-violet-100 text-violet-700", children: ["P", m.importance] })] }), _jsx("p", { className: "text-xs text-slate-600 mt-1 line-clamp-2", children: m.content })] }, m.id))), !important.length && _jsx("p", { className: "text-sm text-slate-500", children: "No memories yet." })] })] })] })] }));
}
