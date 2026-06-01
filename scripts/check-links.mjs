import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const timeoutMs = 15000;

function requestUrl(url, method = "HEAD", redirects = 0) {
  return new Promise(resolve => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;
    const request = client.request(
      parsedUrl,
      {
        method,
        timeout: timeoutMs,
        headers: {
          "User-Agent": "keihatsu-link-check/1.0"
        }
      },
      response => {
        const location = response.headers.location;
        if (
          location &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          redirects < 5
        ) {
          response.resume();
          resolve(requestUrl(new URL(location, parsedUrl).href, method, redirects + 1));
          return;
        }

        response.resume();
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 400,
          status: response.statusCode,
          url
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error(`Timed out after ${timeoutMs}ms`));
    });

    request.on("error", error => {
      resolve({ ok: false, status: "ERROR", url, error: error.message });
    });

    request.end();
  });
}

async function checkLocalFile(relativePath) {
  const cleanPath = relativePath.split("#")[0].split("?")[0];
  const filePath = path.join(rootDir, cleanPath);
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      errors.push(`Local link is not a file: ${relativePath}`);
    } else if (fileStat.size === 0) {
      errors.push(`Local link points to an empty file: ${relativePath}`);
    }
  } catch {
    errors.push(`Missing local link target: ${relativePath}`);
  }
}

async function checkRemoteUrl(url) {
  let result = await requestUrl(url, "HEAD");
  if (!result.ok && [405, 403].includes(result.status)) {
    result = await requestUrl(url, "GET");
  }

  if (!result.ok) {
    const detail = result.error ? ` (${result.error})` : "";
    errors.push(`Remote link failed: ${url} -> ${result.status}${detail}`);
  }
}

const indexHtml = await readFile(path.join(rootDir, "index.html"), "utf8");
const mainJs = await readFile(path.join(rootDir, "main.js"), "utf8");
const linkRefs = new Set();

for (const match of indexHtml.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
  const value = match[1];
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("https://fonts.googleapis.com") ||
    value.startsWith("https://fonts.gstatic.com")
  ) {
    continue;
  }
  linkRefs.add(value);
}

for (const match of mainJs.matchAll(/assets\/[A-Za-z0-9._/-]+/g)) {
  linkRefs.add(match[0]);
}

for (const link of [...linkRefs].sort()) {
  if (/^https?:\/\//.test(link)) {
    await checkRemoteUrl(link);
  } else if (!link.startsWith("data:")) {
    await checkLocalFile(link);
  }
}

for (const warning of warnings) {
  console.warn(`WARN: ${warning}`);
}

if (errors.length) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Link check passed.");
}
