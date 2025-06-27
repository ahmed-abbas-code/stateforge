const path = require("path");
const { execSync } = require("child_process");
const fs = require("fs");

const corePath = path.resolve(__dirname, "../packages/core");
const pkgJsonPath = path.join(corePath, "package.json");
const originalPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));

function log(msg) {
  console.log(`\x1b[36mℹ️ ${msg}\x1b[0m`);
}

function error(msg) {
  console.error(`\x1b[31m❌ ${msg}\x1b[0m`);
}

function runPublish(type) {
  try {
    log("No workspace:* versions found");

    log(`🔧 Running npm version ${type}...`);
    execSync(`npm version ${type}`, {
      stdio: "inherit",
      cwd: corePath, // ✅ context is already @stateforge/core
    });

    log("📦 Installing lockfile only...");
    execSync("pnpm install --lockfile-only", {
      stdio: "inherit",
      cwd: corePath,
    });

    log("🛠️ Building package...");
    execSync("pnpm build", {
      stdio: "inherit",
      cwd: corePath,
    });

    log("🚀 Publishing to GitHub Packages...");
    execSync(
      "npx npm@latest publish --access=restricted --registry=https://npm.pkg.github.com --legacy-peer-deps --force",
      {
        stdio: "inherit",
        cwd: corePath,
      }
    );

    log("✅ Publish complete.");
  } catch (e) {
    error(`Failed during publish process: ${e}`);
    process.exit(1);
  }
}

const type = process.argv[2];
if (!["patch", "minor", "major"].includes(type)) {
  error("Usage: node scripts/temp-publish-core.js [patch|minor|major]");
  process.exit(1);
}

runPublish(type);
