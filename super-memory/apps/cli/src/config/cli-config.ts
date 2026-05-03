import fs from "node:fs";
import path from "node:path";

export type CliConfig = {
  projectName?: string;
  projectId?: string;
  repoName?: string;
  repoId?: string;
  apiUrl: string;
  apiKey?: string;
  authToken?: string;
  userEmail?: string;
  writeMode: "pending" | "active";
  defaultScope: string;
  autoPush: boolean;
  includePatterns: string[];
  excludePatterns: string[];
};

export const defaultConfig: CliConfig = {
  apiUrl: "http://localhost:4000",
  writeMode: "pending",
  defaultScope: "repo",
  autoPush: false,
  includePatterns: ["src/", "app/", "package.json", "docker-compose.yml", "Dockerfile", ".env.example", "README.md"],
  excludePatterns: ["node_modules", "dist", "build", ".git", ".env", ".env.local", ".env.production"]
};

export function ensureDir(cwd: string) {
  const dir = path.join(cwd, ".supermemory");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function loadProjectConfig(cwd: string): CliConfig {
  const file = path.join(cwd, ".supermemory", "config.json");
  if (!fs.existsSync(file)) return { ...defaultConfig };
  return { ...defaultConfig, ...JSON.parse(fs.readFileSync(file, "utf-8")) };
}

export function saveProjectConfig(cwd: string, config: CliConfig) {
  const dir = ensureDir(cwd);
  fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify(config, null, 2));
}
