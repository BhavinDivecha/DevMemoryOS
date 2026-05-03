import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
export function ApiKeysPage() {
    const qc = useQueryClient();
    const [name, setName] = useState("");
    const [newKey, setNewKey] = useState("");
    const keys = useQuery({ queryKey: ["api-keys"], queryFn: async () => (await api.get("/api-keys")).data.data });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "API Keys" }), _jsx("p", { className: "page-subtitle", children: "Create keys for MCP/CLI access. Key value is shown only once." })] }), _jsxs("section", { className: "card card-pad space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2", children: [_jsx("input", { className: "input", value: name, onChange: (e) => setName(e.target.value), placeholder: "Key name (e.g. codex-local)" }), _jsx("button", { className: "btn-primary", onClick: async () => {
                                    const { data } = await api.post("/api-keys", { name: name || "default" });
                                    setNewKey(data.data.key);
                                    setName("");
                                    qc.invalidateQueries({ queryKey: ["api-keys"] });
                                }, children: "Create key" })] }), newKey && (_jsxs("div", { className: "rounded-lg border border-emerald-200 bg-emerald-50 p-3", children: [_jsx("p", { className: "text-sm font-medium text-emerald-900", children: "Copy this key now" }), _jsx("code", { className: "block mt-2 text-xs break-all text-emerald-800", children: newKey })] }))] }), _jsxs("section", { className: "card card-pad space-y-2", children: [_jsx("h2", { className: "font-semibold", children: "Active keys" }), keys.data?.map((k) => (_jsxs("div", { className: "rounded-lg border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: k.name }), _jsxs("p", { className: "text-xs text-slate-500", children: [k.prefix, "... \u2022 Created ", new Date(k.createdAt).toLocaleDateString()] })] }), _jsx("button", { className: "btn-secondary text-red-700 border-red-300", onClick: async () => {
                                    await api.delete(`/api-keys/${k.id}`);
                                    qc.invalidateQueries({ queryKey: ["api-keys"] });
                                }, children: "Revoke" })] }, k.id))), !keys.data?.length && _jsx("p", { className: "text-sm text-slate-500", children: "No API keys yet." })] })] }));
}
