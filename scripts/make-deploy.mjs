// Builds empire-auto-group-deploy.zip for Hostinger's "Upload files" Node.js app flow.
// Leaves out node_modules, the build output, and the local data folder (database + photos).
import { createWriteStream, existsSync } from "node:fs";
import { ZipArchive } from "archiver";

const OUT = "empire-auto-group-deploy.zip";
const INCLUDE_DIRS = ["src", "public", "prisma", "scripts"];
const INCLUDE_FILES = ["package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "postcss.config.mjs", "eslint.config.mjs", "DEPLOY-HOSTINGER.md", "README.md"];
const IGNORE = ["**/*.db", "**/*.db-journal", "**/.DS_Store", "scripts/make-deploy.mjs"];

const output = createWriteStream(OUT);
const zip = new ZipArchive({ zlib: { level: 9 } });
zip.on("warning", (e) => console.warn(e));
zip.on("error", (e) => {
  throw e;
});
zip.pipe(output);

for (const dir of INCLUDE_DIRS) zip.glob(`${dir}/**/*`, { ignore: IGNORE, dot: false });
for (const f of INCLUDE_FILES) if (existsSync(f)) zip.file(f, { name: f });

await zip.finalize();
output.on("close", () => console.log(`${OUT}: ${(zip.pointer() / 1024 / 1024).toFixed(2)} MB`));
