import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "../../lib/api";
import { useState } from "react";
const labels = {
    projects: "Projects",
    clients: "Clients",
    repos: "Repos"
};
export function CrudPage({ entity }) {
    const qc = useQueryClient();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const list = useQuery({ queryKey: [entity], queryFn: async () => (await api.get(`/${entity}`)).data.data });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: labels[entity] }), _jsxs("p", { className: "page-subtitle", children: ["Create and manage ", entity, " that map memory context correctly."] })] }), _jsxs("form", { className: "card card-pad grid grid-cols-1 md:grid-cols-4 gap-2", onSubmit: handleSubmit(async (v) => {
                    setLoading(true);
                    try {
                        await api.post(`/${entity}`, { ...v, slug: v.slug || v.name?.toLowerCase().replace(/\s+/g, "-") });
                        reset();
                        qc.invalidateQueries({ queryKey: [entity] });
                    }
                    finally {
                        setLoading(false);
                    }
                }), children: [_jsx("input", { className: "input", placeholder: "Name", ...register("name", { required: true }) }), _jsx("input", { className: "input", placeholder: "Description", ...register("description") }), entity === "projects" && _jsx("input", { className: "input", placeholder: "slug", ...register("slug") }), _jsx("button", { className: "btn-primary", disabled: loading, children: loading ? "Creating..." : "Create" })] }), _jsx("div", { className: "card card-pad", children: _jsxs("div", { className: "space-y-2", children: [list.data?.map((i) => (_jsxs("div", { className: "rounded-lg border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: i.name }), i.description && _jsx("p", { className: "text-sm text-slate-600", children: i.description })] }), _jsx("button", { className: "btn-secondary text-red-700 border-red-300", onClick: async () => {
                                        await api.delete(`/${entity}/${i.id}`);
                                        qc.invalidateQueries({ queryKey: [entity] });
                                    }, children: "Delete" })] }, i.id))), !list.data?.length && _jsxs("div", { className: "text-sm text-slate-500", children: ["No ", entity, " yet."] })] }) })] }));
}
