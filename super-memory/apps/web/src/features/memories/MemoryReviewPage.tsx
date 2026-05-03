import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";

export function MemoryReviewPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ status: "pending", type: "", severity: "" });

  const items = useQuery({
    queryKey: ["memory-review-items", filters],
    queryFn: async () => (await api.get("/memory-review-items", { params: { status: filters.status || undefined, type: filters.type || undefined, severity: filters.severity || undefined } })).data.data
  });

  const mutate = async (id: string, action: "approve" | "reject" | "ignore") => {
    await api.post(`/memory-review-items/${id}/${action}`, {});
    qc.invalidateQueries({ queryKey: ["memory-review-items"] });
  };

  const list = items.data || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Memory Review Center</h1>
        <p className="page-subtitle">Approve or reject smart-memory suggestions before changes affect active context.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat title="Pending" value={list.filter((x: any) => x.status === "pending").length} />
        <Stat title="Conflicts" value={list.filter((x: any) => x.type === "conflict").length} />
        <Stat title="Duplicates" value={list.filter((x: any) => x.type === "duplicate").length} />
        <Stat title="Stale" value={list.filter((x: any) => x.type === "stale").length} />
        <Stat title="Low Quality" value={list.filter((x: any) => x.type === "low_quality").length} />
      </div>

      <div className="card card-pad grid grid-cols-1 md:grid-cols-4 gap-2">
        <select className="select" value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
          <option value="">All status</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
          <option value="resolved">resolved</option>
          <option value="ignored">ignored</option>
        </select>
        <input className="input" placeholder="type e.g. duplicate" value={filters.type} onChange={(e) => setFilters((s) => ({ ...s, type: e.target.value }))} />
        <select className="select" value={filters.severity} onChange={(e) => setFilters((s) => ({ ...s, severity: e.target.value }))}>
          <option value="">All severity</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="critical">critical</option>
        </select>
        <button className="btn-secondary" onClick={() => qc.invalidateQueries({ queryKey: ["memory-review-items"] })}>Refresh</button>
      </div>

      <div className="space-y-3">
        {list.map((item: any) => (
          <div key={item.id} className="card card-pad">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{item.title}</h3>
              <div className="flex gap-2 text-xs">
                <span className="badge bg-slate-100">{item.type}</span>
                <span className="badge bg-amber-100">{item.severity}</span>
                <span className="badge bg-cyan-100">{item.status}</span>
                <span className="badge bg-violet-100">conf {Number(item.confidence).toFixed(2)}</span>
              </div>
            </div>
            <p className="text-sm text-slate-700 mt-2">{item.description}</p>
            <p className="text-xs text-slate-500 mt-2">Suggested action: {item.suggestedAction}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button className="btn-secondary bg-emerald-50 border-emerald-300 text-emerald-800" onClick={() => mutate(item.id, "approve")}>Approve</button>
              <button className="btn-secondary bg-red-50 border-red-300 text-red-800" onClick={() => mutate(item.id, "reject")}>Reject</button>
              <button className="btn-secondary" onClick={() => mutate(item.id, "ignore")}>Ignore</button>
            </div>
          </div>
        ))}
        {!list.length && <div className="card card-pad text-sm text-slate-500">No review items found.</div>}
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="card card-pad">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
