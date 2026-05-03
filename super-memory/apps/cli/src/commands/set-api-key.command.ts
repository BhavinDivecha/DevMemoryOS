import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Writable } from "node:stream";
import { loadProjectConfig, saveProjectConfig } from "../config/cli-config.js";
import { logger } from "../utils/logger.js";

class MutableStdout extends Writable {
  muted = false;

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    if (!this.muted) output.write(chunk, encoding);
    callback();
  }
}

async function promptHidden(question: string) {
  const mutableStdout = new MutableStdout();
  const rl = readline.createInterface({ input, output: mutableStdout, terminal: true });
  mutableStdout.muted = false;
  output.write(question);
  mutableStdout.muted = true;
  const value = await rl.question("");
  rl.close();
  mutableStdout.muted = false;
  output.write("\n");
  return value.trim();
}

export async function setApiKeyCommand(cwd: string, opts: { apiKey?: string }) {
  const config = loadProjectConfig(cwd);
  const apiKey = opts.apiKey?.trim() || (await promptHidden("Super Memory API key: "));

  if (!apiKey) {
    logger.error("API key cannot be empty.");
    return;
  }

  config.apiKey = apiKey;
  saveProjectConfig(cwd, config);
  logger.info("API key saved to .supermemory/config.json");
}
