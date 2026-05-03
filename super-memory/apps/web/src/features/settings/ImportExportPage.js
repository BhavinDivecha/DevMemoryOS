import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { api } from "../../lib/api";
export function ImportExportPage() {
    const [json, setJson] = useState("");
    const [status, setStatus] = useState("");
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Import & Export" }), _jsx("p", { className: "page-subtitle", children: "Export your full memory dataset or import JSON backups." })] }), _jsxs("div", { className: "card card-pad flex flex-wrap gap-2", children: [_jsx("button", { className: "btn-primary", onClick: async () => {
                            const { data } = await api.get("/export/json");
                            setJson(JSON.stringify(data.data, null, 2));
                            setStatus("Export loaded into editor.");
                        }, children: "Export JSON" }), _jsx("button", { className: "btn-secondary", onClick: async () => {
                            const parsed = JSON.parse(json);
                            await api.post("/import/json", parsed);
                            setStatus("Import completed.");
                        }, children: "Import JSON" })] }), _jsx("div", { className: "card card-pad", children: _jsx("textarea", { className: "textarea min-h-[420px] font-mono text-xs", value: json, onChange: (e) => setJson(e.target.value), placeholder: "Paste JSON here or click Export JSON..." }) }), status && _jsx("div", { className: "rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800", children: status })] }));
}
