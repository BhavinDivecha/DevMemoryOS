import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

const nav = [
  {
    title: "Workspace",
    items: [
      ["Dashboard", "/dashboard"],
      ["Memories", "/memories"],
      ["Memory Review", "/memory-review"],
      ["Scans", "/scans"],
      ["Projects", "/projects"],
      ["Clients", "/clients"],
      ["Repos", "/repos"]
    ]
  },
  {
    title: "Settings",
    items: [
      ["API Keys", "/settings/api-keys"],
      ["Import/Export", "/settings/import-export"]
    ]
  }
];

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/memories": "Memories",
  "/memory-review": "Memory Review",
  "/scans": "Scans",
  "/projects": "Projects",
  "/clients": "Clients",
  "/repos": "Repos",
  "/settings/api-keys": "API Keys",
  "/settings/import-export": "Import & Export"
};

export function Layout() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const setToken = useAuth((s) => s.setToken);
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.post("/auth/logout", {});
    } catch {
      // client token cleanup is still required if API is unavailable
    } finally {
      setToken(null);
      setLoggingOut(false);
      navigate("/login");
    }
  }

  const SidebarContent = (
    <>
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Phase 4</p>
        <h1 className="font-semibold text-xl">Super Memory</h1>
        <p className="text-xs text-slate-300 mt-1">Long-term context with quality controls.</p>
      </div>

      <div className="space-y-5">
        {nav.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-2">{group.title}</p>
            <nav className="space-y-1">
              {group.items.map(([label, href]) => (
                <NavLink
                  key={href}
                  to={href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white border border-transparent"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3">
        <p className="text-[11px] font-medium text-amber-200 mb-1">Security Notice</p>
        <p className="text-[11px] leading-5 text-amber-100/90">Do not store passwords, private keys, API tokens, or sensitive customer data.</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <aside className="hidden md:block bg-gradient-to-b from-slate-950 to-slate-900 text-white p-5 border-r border-slate-800">{SidebarContent}</aside>

      {open && <button className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-gradient-to-b from-slate-950 to-slate-900 text-white p-5 border-r border-slate-800 transform transition-transform md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-200">Menu</p>
          <button className="text-slate-300 hover:text-white" onClick={() => setOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>
        {SidebarContent}
      </aside>

      <main className="p-4 md:p-6">
        <div className="card card-pad mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Super Memory Workspace</p>
            <h2 className="text-lg font-semibold">{titles[location.pathname] || "Workspace"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => setOpen(true)}>Menu</button>
            <button className="btn-secondary" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? "Logging out..." : "Logout"}</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
