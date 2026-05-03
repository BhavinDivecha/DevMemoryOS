import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../lib/api";
const scopes = ["global_user", "project", "client", "repo", "decision", "prompt_rule", "architecture", "api_contract", "deployment", "bug_fix", "preference"];
const statuses = ["active", "pending", "archived", "rejected"];
export function MemoriesPage() {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null);
    const filter = useForm({ defaultValues: { search: "", scope: "", status: "", tag: "" } });
    const createForm = useForm({ defaultValues: { scope: "global_user", importance: 3, status: "active", tags: "" } });
    const editForm = useForm({ defaultValues: { title: "", content: "", scope: "global_user", status: "active", importance: 3, tags: "" } });
    const search = filter.watch("search");
    const scope = filter.watch("scope");
    const status = filter.watch("status");
    const tag = filter.watch("tag");
    const list = useQuery({
        queryKey: ["memories", search, scope, status, tag],
        queryFn: async () => (await api.get("/memories", { params: { search, scope: scope || undefined, status: status || undefined, tag: tag || undefined } })).data.data
    });
    const summary = useMemo(() => {
        const data = list.data || [];
        return {
            total: data.length,
            active: data.filter((m) => m.status === "active").length,
            pending: data.filter((m) => m.status === "pending").length,
            archived: data.filter((m) => m.status === "archived").length
        };
    }, [list.data]);
    function openEdit(memory) {
        setEditing(memory);
        editForm.reset({
            title: memory.title,
            content: memory.content,
            scope: memory.scope,
            status: memory.status,
            importance: memory.importance,
            tags: memory.tags?.join(", ") || ""
        });
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Memories" }), _jsx("p", { className: "page-subtitle", children: "Create, filter, and maintain reusable memory context for coding tools." })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [_jsx(Metric, { title: "Total", value: summary.total }), _jsx(Metric, { title: "Active", value: summary.active }), _jsx(Metric, { title: "Pending", value: summary.pending }), _jsx(Metric, { title: "Archived", value: summary.archived })] }), _jsxs("div", { className: "grid grid-cols-1 2xl:grid-cols-[360px_1fr] gap-4", children: [_jsxs("aside", { className: "card card-pad 2xl:sticky 2xl:top-4 h-fit", children: [_jsx("h2", { className: "font-semibold mb-3", children: "Create memory" }), _jsxs("form", { className: "space-y-3", onSubmit: createForm.handleSubmit(async (v) => {
                                    await api.post("/memories", {
                                        ...v,
                                        tags: String(v.tags || "").split(",").map((x) => x.trim()).filter(Boolean)
                                    });
                                    createForm.reset({ scope: "global_user", importance: 3, status: "active", tags: "" });
                                    qc.invalidateQueries({ queryKey: ["memories"] });
                                }), children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Title" }), _jsx("input", { className: "input", placeholder: "e.g. Fastify version rule", ...createForm.register("title", { required: true }) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Scope" }), _jsx("select", { className: "select", ...createForm.register("scope"), children: scopes.map((s) => _jsx("option", { value: s, children: s }, s)) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Content" }), _jsx("textarea", { className: "textarea min-h-28", placeholder: "Write durable context...", ...createForm.register("content", { required: true }) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Tags" }), _jsx("input", { className: "input", placeholder: "backend, rule, api", ...createForm.register("tags") })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Status" }), _jsx("select", { className: "select", ...createForm.register("status"), children: statuses.map((s) => _jsx("option", { value: s, children: s }, s)) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Importance" }), _jsx("input", { className: "input", type: "number", min: 1, max: 5, ...createForm.register("importance", { valueAsNumber: true }) })] })] }), _jsx("p", { className: "text-[11px] text-slate-500", children: "Do not store secrets or private credentials." }), _jsx("button", { className: "btn-primary w-full", children: "Create Memory" })] })] }), _jsxs("section", { className: "card card-pad", children: [_jsx("h2", { className: "font-semibold mb-3", children: "Search & filter" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 mb-4", children: [_jsx("input", { className: "input", placeholder: "Search title/content", ...filter.register("search") }), _jsxs("select", { className: "select", ...filter.register("scope"), children: [_jsx("option", { value: "", children: "All scopes" }), scopes.map((s) => _jsx("option", { value: s, children: s }, s))] }), _jsxs("select", { className: "select", ...filter.register("status"), children: [_jsx("option", { value: "", children: "All statuses" }), statuses.map((s) => _jsx("option", { value: s, children: s }, s))] }), _jsx("input", { className: "input", placeholder: "Tag", ...filter.register("tag") })] }), list.isLoading && _jsx("div", { className: "text-sm text-slate-500 py-6", children: "Loading memories..." }), _jsxs("div", { className: "space-y-3", children: [list.data?.map((m) => (_jsxs("article", { className: "rounded-lg border border-slate-200 p-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("h3", { className: "font-semibold", children: m.title }), _jsxs("div", { className: "flex gap-1 text-xs", children: [_jsx("span", { className: "badge bg-cyan-100 text-cyan-800", children: m.scope }), _jsx("span", { className: "badge bg-slate-100 text-slate-700", children: m.status }), _jsxs("span", { className: "badge bg-violet-100 text-violet-700", children: ["P", m.importance] })] })] }), _jsx("p", { className: "text-sm mt-2 text-slate-700 break-words", children: m.content }), _jsx("div", { className: "text-xs mt-2 text-slate-500 flex flex-wrap gap-2", children: (m.tags || []).map((t) => _jsxs("span", { className: "badge bg-slate-100 text-slate-700", children: ["#", t] }, t)) }), _jsxs("div", { className: "text-[11px] text-slate-400 mt-2", children: ["Created ", new Date(m.createdAt).toLocaleString()] }), _jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [_jsx("button", { className: "btn-secondary", onClick: () => openEdit(m), children: "Edit" }), m.status !== "archived" ? (_jsx("button", { className: "btn-secondary", onClick: async () => { await api.post(`/memories/${m.id}/archive`, {}); qc.invalidateQueries({ queryKey: ["memories"] }); }, children: "Archive" })) : (_jsx("button", { className: "btn-secondary", onClick: async () => { await api.post(`/memories/${m.id}/restore`, {}); qc.invalidateQueries({ queryKey: ["memories"] }); }, children: "Restore" })), _jsx("button", { className: "btn-secondary text-red-700 border-red-300", onClick: async () => { await api.delete(`/memories/${m.id}`); qc.invalidateQueries({ queryKey: ["memories"] }); }, children: "Delete" })] })] }, m.id))), !list.data?.length && _jsx("div", { className: "text-sm text-slate-500 border rounded-lg p-4", children: "No memories match current filters." })] })] })] }), editing && (_jsx("div", { className: "fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4", children: _jsxs("form", { className: "bg-white rounded-lg w-full max-w-2xl p-4 space-y-3", onSubmit: editForm.handleSubmit(async (v) => {
                        await api.patch(`/memories/${editing.id}`, {
                            ...v,
                            tags: String(v.tags || "").split(",").map((x) => x.trim()).filter(Boolean)
                        });
                        setEditing(null);
                        qc.invalidateQueries({ queryKey: ["memories"] });
                    }), children: [_jsx("h3", { className: "font-semibold", children: "Edit memory" }), _jsx("input", { className: "input", ...editForm.register("title", { required: true }) }), _jsx("textarea", { className: "textarea", rows: 4, ...editForm.register("content", { required: true }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: [_jsx("select", { className: "select", ...editForm.register("scope"), children: scopes.map((s) => _jsx("option", { value: s, children: s }, s)) }), _jsx("select", { className: "select", ...editForm.register("status"), children: statuses.map((s) => _jsx("option", { value: s, children: s }, s)) }), _jsx("input", { className: "input", type: "number", min: 1, max: 5, ...editForm.register("importance", { valueAsNumber: true }) }), _jsx("input", { className: "input", placeholder: "tag1, tag2", ...editForm.register("tags") })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx("button", { type: "button", className: "btn-secondary", onClick: () => setEditing(null), children: "Cancel" }), _jsx("button", { className: "btn-primary", children: "Save changes" })] })] }) }))] }));
}
function Metric({ title, value }) {
    return (_jsxs("div", { className: "card card-pad", children: [_jsx("p", { className: "text-xs text-slate-500", children: title }), _jsx("p", { className: "text-2xl font-semibold mt-1", children: value })] }));
}
