import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = ["index.html", "main.js", "styles.css"];
const errors = [];
const warnings = [];

const toPosix = value => value.split(path.sep).join("/");

async function existsAsFile(relativePath) {
  try {
    const fileStat = await stat(path.join(rootDir, relativePath));
    return fileStat.isFile() ? fileStat : null;
  } catch {
    return null;
  }
}

async function collectFiles(directory) {
  const entries = await readdir(path.join(rootDir, directory), { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(relativePath));
    } else if (entry.isFile()) {
      files.push(toPosix(relativePath));
    }
  }

  return files;
}

for (const file of requiredFiles) {
  if (!await existsAsFile(file)) {
    errors.push(`Missing required file: ${file}`);
  }
}

const indexHtml = await readFile(path.join(rootDir, "index.html"), "utf8");
const mainJs = await readFile(path.join(rootDir, "main.js"), "utf8");

if (indexHtml.includes("=<head>")) {
  errors.push("Suspicious HTML found: =<head>");
}

if (!/<head[\s>]/.test(indexHtml)) {
  errors.push("Missing <head> element in index.html");
}

if (!/<main\s+id=["']main["']/.test(indexHtml)) {
  errors.push('Missing <main id="main"> in index.html');
}

if (!/<script\s+type=["']module["']\s+src=["']main\.js["']/.test(indexHtml)) {
  errors.push('Missing <script type="module" src="main.js"> in index.html');
}

if (!/<link\s+rel=["']stylesheet["']\s+href=["']styles\.css["']/.test(indexHtml)) {
  errors.push('Missing stylesheet link for styles.css in index.html');
}

const referenceSources = [
  ["index.html", indexHtml],
  ["main.js", mainJs]
];
const assetRefs = new Map();

for (const [sourceName, source] of referenceSources) {
  for (const match of source.matchAll(/assets\/[A-Za-z0-9._/-]+/g)) {
    const reference = match[0].replace(/[.,;:]+$/u, "");
    if (!assetRefs.has(reference)) {
      assetRefs.set(reference, new Set());
    }
    assetRefs.get(reference).add(sourceName);
  }
}

for (const [reference, sourceNames] of assetRefs) {
  const fileStat = await existsAsFile(reference);
  const sources = [...sourceNames].join(", ");
  if (!fileStat) {
    errors.push(`Missing asset: ${reference} referenced from ${sources}`);
  } else if (fileStat.size === 0) {
    errors.push(`Empty referenced asset: ${reference} referenced from ${sources}`);
  }
}

const assetFiles = await collectFiles("assets");
for (const file of assetFiles) {
  const fileStat = await stat(path.join(rootDir, file));
  if (fileStat.size === 0) {
    errors.push(`Empty asset file: ${file}`);
  }
}

const referencedAssets = new Set(assetRefs.keys());
const unusedActiveAssets = assetFiles.filter(
  file => !file.startsWith("assets/archived/") && !referencedAssets.has(file)
);

for (const file of unusedActiveAssets) {
  warnings.push(`Unused active asset: ${file}`);
}

try {
  new vm.Script(mainJs, { filename: "main.js" });
} catch (error) {
  errors.push(`main.js syntax check failed: ${error.message}`);
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
  console.log("Site check passed.");
}
