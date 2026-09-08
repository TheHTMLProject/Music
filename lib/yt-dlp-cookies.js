import fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function withYtDlpCookies({ cookieFile, browser, allowedBrowsers }, operation) {
  let cookieDirectory = "";
  try {
    if (cookieFile) {
      cookieDirectory = await fs.promises.mkdtemp(join(tmpdir(), "thp-music-cookies-"));
      const writableCookieFile = join(cookieDirectory, "youtube-cookies.txt");
      await fs.promises.copyFile(cookieFile, writableCookieFile);
      await fs.promises.chmod(writableCookieFile, 0o600);
      return await operation(["--cookies", writableCookieFile]);
    }
    if (allowedBrowsers.has(browser)) return await operation(["--cookies-from-browser", browser]);
    return await operation([]);
  } finally {
    if (cookieDirectory) await fs.promises.rm(cookieDirectory, { recursive: true, force: true });
  }
}
