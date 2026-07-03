import path from "node:path";
import { describe, expect, it } from "vitest";
import { decodeBase64Strict, resolveFilePath } from "../src/secret-file.js";

describe("decodeBase64Strict", () => {
  it("decodes valid base64", () => {
    const encoded = Buffer.from("hello world\n").toString("base64");
    expect(decodeBase64Strict(encoded).toString()).toBe("hello world\n");
  });

  it("decodes binary content losslessly", () => {
    const bytes = Buffer.from([0, 1, 2, 253, 254, 255]);
    expect(decodeBase64Strict(bytes.toString("base64"))).toEqual(bytes);
  });

  it("accepts base64 with embedded newlines and whitespace", () => {
    const encoded = Buffer.from("multi-line secret content").toString("base64");
    const wrapped = encoded.replace(/(.{8})/g, "$1\n") + "\n";
    expect(decodeBase64Strict(wrapped).toString()).toBe(
      "multi-line secret content",
    );
  });

  it("rejects an empty string", () => {
    expect(() => decodeBase64Strict("")).toThrow(/must not be empty/);
    expect(() => decodeBase64Strict("  \n ")).toThrow(/must not be empty/);
  });

  it("rejects non-base64 garbage", () => {
    expect(() => decodeBase64Strict("not base64!!")).toThrow(
      /not valid base64/,
    );
  });

  it("rejects bad padding", () => {
    expect(() => decodeBase64Strict("abc")).toThrow(/not valid base64/);
    expect(() => decodeBase64Strict("ab=c")).toThrow(/not valid base64/);
    expect(() => decodeBase64Strict("a===")).toThrow(/not valid base64/);
  });
});

describe("resolveFilePath", () => {
  it("resolves a relative working directory to an absolute path", () => {
    expect(resolveFilePath("./a/b/c", "hello.sh")).toBe(
      path.resolve("a/b/c/hello.sh"),
    );
  });

  it("keeps supporting nested filenames", () => {
    expect(resolveFilePath(".", "sub/file.txt")).toBe(
      path.resolve("sub/file.txt"),
    );
  });

  it("supports absolute working directories", () => {
    expect(resolveFilePath("/tmp/build", "cert.p12")).toBe(
      path.join(path.resolve("/tmp/build"), "cert.p12"),
    );
  });

  it("defaults an empty working directory to the current directory", () => {
    expect(resolveFilePath("", "file.txt")).toBe(path.resolve("file.txt"));
  });

  it("rejects an empty filename", () => {
    expect(() => resolveFilePath(".", "")).toThrow(/must not be empty/);
    expect(() => resolveFilePath(".", "  ")).toThrow(/must not be empty/);
  });

  it("rejects filenames escaping the working directory", () => {
    expect(() => resolveFilePath("./a/b", "../escape.txt")).toThrow(
      /inside the working directory/,
    );
    expect(() => resolveFilePath(".", "sub/../../escape.txt")).toThrow(
      /inside the working directory/,
    );
  });

  it("rejects a filename resolving to the working directory itself", () => {
    expect(() => resolveFilePath("./a", ".")).toThrow(
      /inside the working directory/,
    );
  });
});
