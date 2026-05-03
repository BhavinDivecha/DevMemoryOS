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
    ["Active memories", data.filter((m: any) => m.status === "active").length],
    ["Pending memories", data.filter((m: any) => m.status === "pending").length],
    ["Projects", projects.data?.length || 0],
    ["Clients", clients.data?.length || 0],
    ["Repos", repos.data?.length || 0]
  ];

  const recent = [...data].sort((a: any, b: any) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 6);
  const important = [...data].sort((a: any, b: any) => b.importance - a.importance).slice(0, 6);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Quick overview of memory quality, activity, and workspace entities.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
        {cards.map(([title, value]) => (
          <div key={String(title)} className="card card-pad">
            <p className="text-xs text-slate-500">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="card card-pad">
          <h2 className="font-semibold">Recent memories</h2>
          <div className="mt-3 space-y-2">
            {recent.map((m: any) => (
              <div key={m.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-sm">{m.title}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{m.content}</p>
              </div>
            ))}
            {!recent.length && <p className="text-sm text-slate-500">No memories yet.</p>}
          </div>
        </section>

        <section className="card card-pad">
          <h2 className="font-semibold">Important memories</h2>
          <div className="mt-3 space-y-2">
            {important.map((m: any) => (
              <div key={m.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">{m.title}</p>
                  <span className="badge bg-violet-100 text-violet-700">P{m.importance}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{m.content}</p>
              </div>
            ))}
            {!important.length && <p className="text-sm text-slate-500">No memories yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
