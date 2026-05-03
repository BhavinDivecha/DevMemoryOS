import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "../../lib/api";
import { useState } from "react";

const labels = {
  projects: "Projects",
  clients: "Clients",
  repos: "Repos"
} as const;

export function CrudPage({ entity }: { entity: "projects" | "clients" | "repos" }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>();
  const list = useQuery({ queryKey: [entity], queryFn: async () => (await api.get(`/${entity}`)).data.data });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">{labels[entity]}</h1>
        <p className="page-subtitle">Create and manage {entity} that map memory context correctly.</p>
      </div>

      <form
        className="card card-pad grid grid-cols-1 md:grid-cols-4 gap-2"
        onSubmit={handleSubmit(async (v) => {
          setLoading(true);
          try {
            await api.post(`/${entity}`, { ...v, slug: v.slug || v.name?.toLowerCase().replace(/\s+/g, "-") });
            reset();
            qc.invalidateQueries({ queryKey: [entity] });
          } finally {
            setLoading(false);
          }
        })}
      >
        <input className="input" placeholder="Name" {...register("name", { required: true })} />
        <input className="input" placeholder="Description" {...register("description")} />
        {entity === "projects" && <input className="input" placeholder="slug" {...register("slug")} />}
        <button className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Create"}</button>
      </form>

      <div className="card card-pad">
        <div className="space-y-2">
          {list.data?.map((i: any) => (
            <div key={i.id} className="rounded-lg border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{i.name}</p>
                {i.description && <p className="text-sm text-slate-600">{i.description}</p>}
              </div>
              <button
                className="btn-secondary text-red-700 border-red-300"
                onClick={async () => {
                  await api.delete(`/${entity}/${i.id}`);
                  qc.invalidateQueries({ queryKey: [entity] });
                }}
              >
                Delete
              </button>
            </div>
          ))}
          {!list.data?.length && <div className="text-sm text-slate-500">No {entity} yet.</div>}
        </div>
      </div>
    </div>
  );
}
