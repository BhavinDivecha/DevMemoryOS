import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../lib/api";

const scopes = ["global_user", "project", "client", "repo", "decision", "prompt_rule", "architecture", "api_contract", "deployment", "bug_fix", "preference"];
const statuses = ["active", "pending", "archived", "rejected"];

export function MemoriesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const filter = useForm({ defaultValues: { search: "", scope: "", status: "", tag: "" } });
  const createForm = useForm<any>({ defaultValues: { scope: "global_user", importance: 3, status: "active", tags: "" } });
  const editForm = useForm<any>({ defaultValues: { title: "", content: "", scope: "global_user", status: "active", importance: 3, tags: "" } });
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
      active: data.filter((m: any) => m.status === "active").length,
      pending: data.filter((m: any) => m.status === "pending").length,
      archived: data.filter((m: any) => m.status === "archived").length
    };
  }, [list.data]);

  function openEdit(memory: any) {
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Memories</h1>
        <p className="page-subtitle">Create, filter, and maintain reusable memory context for coding tools.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric title="Total" value={summary.total} />
        <Metric title="Active" value={summary.active} />
        <Metric title="Pending" value={summary.pending} />
        <Metric title="Archived" value={summary.archived} />
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-[360px_1fr] gap-4">
        <aside className="card card-pad 2xl:sticky 2xl:top-4 h-fit">
          <h2 className="font-semibold mb-3">Create memory</h2>
          <form
            className="space-y-3"
            onSubmit={createForm.handleSubmit(async (v) => {
              await api.post("/memories", {
                ...v,
                tags: String(v.tags || "").split(",").map((x) => x.trim()).filter(Boolean)
              });
              createForm.reset({ scope: "global_user", importance: 3, status: "active", tags: "" });
              qc.invalidateQueries({ queryKey: ["memories"] });
            })}
          >
            <div>
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Fastify version rule" {...createForm.register("title", { required: true })} />
            </div>
            <div>
              <label className="label">Scope</label>
              <select className="select" {...createForm.register("scope")}>{scopes.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <div>
              <label className="label">Content</label>
              <textarea className="textarea min-h-28" placeholder="Write durable context..." {...createForm.register("content", { required: true })} />
            </div>
            <div>
              <label className="label">Tags</label>
              <input className="input" placeholder="backend, rule, api" {...createForm.register("tags")} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Status</label>
                <select className="select" {...createForm.register("status")}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </div>
              <div>
                <label className="label">Importance</label>
                <input className="input" type="number" min={1} max={5} {...createForm.register("importance", { valueAsNumber: true })} />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">Do not store secrets or private credentials.</p>
            <button className="btn-primary w-full">Create Memory</button>
          </form>
        </aside>

        <section className="card card-pad">
          <h2 className="font-semibold mb-3">Search & filter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 mb-4">
            <input className="input" placeholder="Search title/content" {...filter.register("search")} />
            <select className="select" {...filter.register("scope")}><option value="">All scopes</option>{scopes.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <select className="select" {...filter.register("status")}><option value="">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <input className="input" placeholder="Tag" {...filter.register("tag")} />
          </div>

          {list.isLoading && <div className="text-sm text-slate-500 py-6">Loading memories...</div>}

          <div className="space-y-3">
            {list.data?.map((m: any) => (
              <article key={m.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{m.title}</h3>
                  <div className="flex gap-1 text-xs">
                    <span className="badge bg-cyan-100 text-cyan-800">{m.scope}</span>
                    <span className="badge bg-slate-100 text-slate-700">{m.status}</span>
                    <span className="badge bg-violet-100 text-violet-700">P{m.importance}</span>
                  </div>
                </div>
                <p className="text-sm mt-2 text-slate-700 break-words">{m.content}</p>
                <div className="text-xs mt-2 text-slate-500 flex flex-wrap gap-2">
                  {(m.tags || []).map((t: string) => <span key={t} className="badge bg-slate-100 text-slate-700">#{t}</span>)}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">Created {new Date(m.createdAt).toLocaleString()}</div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary" onClick={() => openEdit(m)}>Edit</button>
                  {m.status !== "archived" ? (
                    <button className="btn-secondary" onClick={async () => { await api.post(`/memories/${m.id}/archive`, {}); qc.invalidateQueries({ queryKey: ["memories"] }); }}>Archive</button>
                  ) : (
                    <button className="btn-secondary" onClick={async () => { await api.post(`/memories/${m.id}/restore`, {}); qc.invalidateQueries({ queryKey: ["memories"] }); }}>Restore</button>
                  )}
                  <button className="btn-secondary text-red-700 border-red-300" onClick={async () => { await api.delete(`/memories/${m.id}`); qc.invalidateQueries({ queryKey: ["memories"] }); }}>Delete</button>
                </div>
              </article>
            ))}
            {!list.data?.length && <div className="text-sm text-slate-500 border rounded-lg p-4">No memories match current filters.</div>}
          </div>
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <form
            className="bg-white rounded-lg w-full max-w-2xl p-4 space-y-3"
            onSubmit={editForm.handleSubmit(async (v) => {
              await api.patch(`/memories/${editing.id}`, {
                ...v,
                tags: String(v.tags || "").split(",").map((x) => x.trim()).filter(Boolean)
              });
              setEditing(null);
              qc.invalidateQueries({ queryKey: ["memories"] });
            })}
          >
            <h3 className="font-semibold">Edit memory</h3>
            <input className="input" {...editForm.register("title", { required: true })} />
            <textarea className="textarea" rows={4} {...editForm.register("content", { required: true })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select className="select" {...editForm.register("scope")}>{scopes.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              <select className="select" {...editForm.register("status")}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              <input className="input" type="number" min={1} max={5} {...editForm.register("importance", { valueAsNumber: true })} />
              <input className="input" placeholder="tag1, tag2" {...editForm.register("tags")} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="card card-pad">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
