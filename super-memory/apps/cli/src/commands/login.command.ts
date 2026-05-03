import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Writable } from "node:stream";
import { loadProjectConfig, saveProjectConfig } from "../config/cli-config.js";
import { makeClient } from "../clients/super-memory-api.client.js";
import { logger } from "../utils/logger.js";

class MutableStdout extends Writable {
  muted = false;

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    if (!this.muted) output.write(chunk, encoding);
    callback();
  }
}

async function promptEmail(defaultEmail?: string) {
  const rl = readline.createInterface({ input, output });
  const q = defaultEmail ? `Email (${defaultEmail}): ` : "Email: ";
  const value = (await rl.question(q)).trim();
  rl.close();
  return value || defaultEmail || "";
}

async function promptPassword() {
  const mutableStdout = new MutableStdout();
  const rl = readline.createInterface({ input, output: mutableStdout, terminal: true });
  mutableStdout.muted = false;
  output.write("Password: ");
  mutableStdout.muted = true;
  const password = await rl.question("");
  rl.close();
  mutableStdout.muted = false;
  output.write("\n");
  return password;
}

export async function loginCommand(cwd: string, opts: { email?: string; password?: string }) {
  const config = loadProjectConfig(cwd);
  const client = makeClient(config.apiUrl, config.apiKey);

  const email = (opts.email || (await promptEmail(config.userEmail))).trim();
  const password = opts.password || (await promptPassword());

  if (!email || !password) {
    logger.error("Email and password are required.");
    return;
  }

  const res = await client.login(email, password);
  if (!res.success || !res.data?.token) {
    logger.error(`Login failed: ${JSON.stringify(res.error || res, null, 2)}`);
    return;
  }

  config.authToken = res.data.token;
  config.userEmail = email;
  saveProjectConfig(cwd, config);
  logger.info(`Login successful. Token saved for ${email}.`);
}
