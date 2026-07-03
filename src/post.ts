import fs from "node:fs";
import * as core from "@actions/core";
import { resolveFilePath } from "./secret-file.js";

function resolveTarget(): string | undefined {
  const fromState = core.getState("file-path");
  if (fromState) {
    return fromState;
  }
  // Fallback for the case that main never reached saveState.
  const filename = core.getInput("filename");
  if (!filename) {
    return undefined;
  }
  return resolveFilePath(core.getInput("working-directory"), filename);
}

export function cleanup(): void {
  try {
    const filePath = resolveTarget();
    if (!filePath) {
      core.info("No file to clean up.");
      return;
    }
    fs.rmSync(filePath, { force: true });
    core.info(`${filePath} deleted!`);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

cleanup();
