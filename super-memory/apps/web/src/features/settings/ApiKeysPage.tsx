import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";

export function ApiKeysPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState("");
  const keys = useQuery({ queryKey: ["api-keys"], queryFn: async () => (await api.get("/api-keys")).data.data });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">API Keys</h1>
        <p className="page-subtitle">Create keys for MCP/CLI access. Key value is shown only once.</p>
      </div>

      <section className="card card-pad space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name (e.g. codex-local)" />
          <button
            className="btn-primary"
            onClick={async () => {
              const { data } = await api.post("/api-keys", { name: name || "default" });
              setNewKey(data.data.key);
              setName("");
              qc.invalidateQueries({ queryKey: ["api-keys"] });
            }}
          >
            Create key
          </button>
        </div>

        {newKey && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-medium text-emerald-900">Copy this key now</p>
            <code className="block mt-2 text-xs break-all text-emerald-800">{newKey}</code>
          </div>
        )}
      </section>

      <section className="card card-pad space-y-2">
        <h2 className="font-semibold">Active keys</h2>
        {keys.data?.map((k: any) => (
          <div key={k.id} className="rounded-lg border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">{k.name}</p>
              <p className="text-xs text-slate-500">{k.prefix}... • Created {new Date(k.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              className="btn-secondary text-red-700 border-red-300"
              onClick={async () => {
                await api.delete(`/api-keys/${k.id}`);
                qc.invalidateQueries({ queryKey: ["api-keys"] });
              }}
            >
              Revoke
            </button>
          </div>
        ))}
        {!keys.data?.length && <p className="text-sm text-slate-500">No API keys yet.</p>}
      </section>
    </div>
  );
}
