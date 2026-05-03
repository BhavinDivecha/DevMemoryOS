import { execSync } from "node:child_process";

export function getGitMeta(cwd: string) {
  const run = (cmd: string) => {
    try {
      return execSync(cmd, { cwd, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    } catch {
      return "";
    }
  };
  return {
    commitSha: run("git rev-parse HEAD"),
    branchName: run("git rev-parse --abbrev-ref HEAD"),
    remoteUrl: run("git config --get remote.origin.url")
  };
}
