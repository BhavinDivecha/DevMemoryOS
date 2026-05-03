import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export function ScansPage() {
  const qc = useQueryClient();
  const scans = useQuery({ queryKey: ["scan-results"], queryFn: async () => (await api.get("/scan-results")).data.data });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Scan Results</h1>
        <p className="page-subtitle">Review generated memories before applying them to active memory storage.</p>
      </div>

      <div className="space-y-3">
        {scans.data?.map((scan: any) => (
          <div key={scan.id} className="card card-pad">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <div>
                <h2 className="font-semibold">{scan.repo?.name || scan.repoPath || "Unknown Repo"}</h2>
                <p className="text-xs text-slate-500">{scan.branchName || "-"} {scan.commitSha ? `• ${String(scan.commitSha).slice(0, 8)}` : ""}</p>
              </div>
              <span className="badge bg-slate-100 text-slate-700">{scan.status}</span>
            </div>

            <div className="text-xs text-slate-600 mb-3">Detected stack: {JSON.stringify(scan.detectedStack || {})}</div>

            <div className="space-y-2 mb-3">
              {(scan.generatedMemories || []).slice(0, 6).map((m: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-slate-200 p-2">
                  <p className="font-medium text-sm">{m.title}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{m.content}</p>
                </div>
              ))}
              {(scan.generatedMemories || []).length > 6 && <p className="text-xs text-slate-500">+ {(scan.generatedMemories || []).length - 6} more memories</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="btn-primary"
                onClick={async () => {
                  await api.post(`/scan-results/${scan.id}/apply`, {});
                  qc.invalidateQueries({ queryKey: ["scan-results"] });
                }}
              >
                Apply all
              </button>
              <button
                className="btn-secondary text-red-700 border-red-300"
                onClick={async () => {
                  await api.delete(`/scan-results/${scan.id}`);
                  qc.invalidateQueries({ queryKey: ["scan-results"] });
                }}
              >
                Reject / Archive
              </button>
            </div>
          </div>
        ))}

        {!scans.data?.length && <div className="card card-pad text-sm text-slate-500">No scan results yet.</div>}
      </div>
    </div>
  );
}
