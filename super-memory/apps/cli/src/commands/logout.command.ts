import { loadProjectConfig, saveProjectConfig } from "../config/cli-config.js";
import { logger } from "../utils/logger.js";

export async function logoutCommand(cwd: string) {
  const config = loadProjectConfig(cwd);

  const hadToken = Boolean(config.authToken);
  delete config.authToken;
  delete config.userEmail;

  saveProjectConfig(cwd, config);
  logger.info(hadToken ? "Logged out. Local auth token removed." : "No active local login found.");
}
