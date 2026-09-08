import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { withYtDlpCookies } from "../lib/yt-dlp-cookies.js";

test("uses a writable temporary copy for a configured cookie file", async () => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), "thp-cookie-test-"));
  const source = path.join(directory, "source.txt");
  await fs.promises.writeFile(source, "cookie-data", { mode: 0o400 });
  let temporaryFile = "";
  try {
    const result = await withYtDlpCookies({
      cookieFile: source,
      browser: "",
      allowedBrowsers: new Set(),
    }, async (args) => {
      assert.equal(args[0], "--cookies");
      temporaryFile = args[1];
      assert.notEqual(temporaryFile, source);
      await fs.promises.appendFile(temporaryFile, "-updated");
      return await fs.promises.readFile(temporaryFile, "utf8");
    });
    assert.equal(result, "cookie-data-updated");
    assert.equal(await fs.promises.readFile(source, "utf8"), "cookie-data");
    assert.equal(fs.existsSync(temporaryFile), false);
  } finally {
    await fs.promises.chmod(source, 0o600).catch(() => {});
    await fs.promises.rm(directory, { recursive: true, force: true });
  }
});

test("uses an allowed browser only when no cookie file is configured", async () => {
  const result = await withYtDlpCookies({
    cookieFile: "",
    browser: "firefox",
    allowedBrowsers: new Set(["firefox"]),
  }, async (args) => args);
  assert.deepEqual(result, ["--cookies-from-browser", "firefox"]);
});
