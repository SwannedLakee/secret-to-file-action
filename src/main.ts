import fs from "node:fs";
import path from "node:path";
import * as core from "@actions/core";
import { decodeBase64Strict, resolveFilePath } from "./secret-file.js";

export function run(): void {
  try {
    const content = decodeBase64Strict(
      core.getInput("base64-encoded-secret", { required: true }),
    );
    const filename = core.getInput("filename", { required: true });
    const workingDirectory = core.getInput("working-directory");
    const isExecutable = core.getInput("is-executable")
      ? core.getBooleanInput("is-executable")
      : false;

    const filePath = resolveFilePath(workingDirectory, filename);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    if (isExecutable) {
      fs.chmodSync(filePath, 0o755);
    }

    core.saveState("file-path", filePath);
    core.setOutput("file-path", filePath);
    core.info(`${filePath} created!`);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
