import { useState } from "react";
import { api } from "../../lib/api";

export function ImportExportPage() {
  const [json, setJson] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Import & Export</h1>
        <p className="page-subtitle">Export your full memory dataset or import JSON backups.</p>
      </div>

      <div className="card card-pad flex flex-wrap gap-2">
        <button
          className="btn-primary"
          onClick={async () => {
            const { data } = await api.get("/export/json");
            setJson(JSON.stringify(data.data, null, 2));
            setStatus("Export loaded into editor.");
          }}
        >
          Export JSON
        </button>
        <button
          className="btn-secondary"
          onClick={async () => {
            const parsed = JSON.parse(json);
            await api.post("/import/json", parsed);
            setStatus("Import completed.");
          }}
        >
          Import JSON
        </button>
      </div>

      <div className="card card-pad">
        <textarea className="textarea min-h-[420px] font-mono text-xs" value={json} onChange={(e) => setJson(e.target.value)} placeholder="Paste JSON here or click Export JSON..." />
      </div>

      {status && <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800">{status}</div>}
    </div>
  );
}
