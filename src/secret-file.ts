import path from "node:path";

/**
 * Decodes a base64 string, rejecting input that Buffer.from would
 * silently misinterpret (empty strings, invalid characters, bad padding).
 * Whitespace is stripped first so multi-line output of `base64 <file>`
 * keeps working.
 */
export function decodeBase64Strict(input: string): Buffer {
  const normalized = input.replace(/\s+/g, "");

  if (normalized.length === 0) {
    throw new Error("Input 'base64-encoded-secret' must not be empty.");
  }

  if (
    normalized.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized) ||
    (normalized.indexOf("=") !== -1 &&
      normalized.indexOf("=") < normalized.length - 2)
  ) {
    throw new Error(
      "Input 'base64-encoded-secret' is not valid base64. " +
        "Encode the file first, e.g. `base64 -i <file>` on macOS or `base64 <file>` on Linux.",
    );
  }

  return Buffer.from(normalized, "base64");
}

/**
 * Resolves the absolute path of the file to create. The filename may
 * contain sub-directories but must not escape the working directory
 * (e.g. via `../`). The working directory itself is intentionally
 * unrestricted: callers explicitly choose it, including absolute paths.
 */
export function resolveFilePath(
  workingDirectory: string,
  filename: string,
): string {
  if (filename.trim().length === 0) {
    throw new Error("Input 'filename' must not be empty.");
  }

  const baseDir = path.resolve(workingDirectory || ".");
  const filePath = path.resolve(baseDir, filename);

  if (!filePath.startsWith(baseDir + path.sep)) {
    throw new Error(
      `Input 'filename' must resolve to a file inside the working directory, got: ${filename}`,
    );
  }

  return filePath;
}
