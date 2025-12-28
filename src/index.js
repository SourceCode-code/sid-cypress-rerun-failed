#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = process.cwd();
const resultsDir = path.join(projectRoot, "cypress", "results");
const failedSpecsPath = path.join(
  projectRoot,
  "cypress",
  "failed-specs.json"
);

/* ----------------------------------
   Helpers
----------------------------------- */
function run(cmd) {
  console.log(`${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function cleanupOldFailedSpecReports(reportDir, failedSpecs) {
  if (!fs.existsSync(reportDir)) return;

  const files = fs.readdirSync(reportDir).filter(f =>
    f.endsWith(".json")
  );

  failedSpecs.forEach(specPath => {
    const specName = path.basename(specPath);

    const matching = files.filter(f =>
      f.includes(specName)
    );

    if (matching.length <= 1) return;

    // sort by timestamp in filename
    matching.sort((a, b) => {
      const ta = a.match(/fail_(.+?)-/)?.[1] || "";
      const tb = b.match(/fail_(.+?)-/)?.[1] || "";
      return ta.localeCompare(tb);
    });

    // keep latest, delete rest
    matching.slice(0, -1).forEach(file => {
      fs.unlinkSync(path.join(reportDir, file));
      console.log(`Deleted old report: ${file}`);
    });
  });
}

/* ----------------------------------
   CLI Flow
----------------------------------- */
if (!fs.existsSync(failedSpecsPath)) {
  console.log("No failed-specs.json found. Nothing to rerun.");
  process.exit(0);
}

const failedSpecs = JSON.parse(
  fs.readFileSync(failedSpecsPath, "utf8")
);

if (!failedSpecs.length) {
  console.log("No failed specs to rerun.");
  process.exit(0);
}

//  Rerun failed specs
run(
  `npx cypress run --spec "${failedSpecs.join(",")}"`
);

// Cleanup old reports
cleanupOldFailedSpecReports(resultsDir, failedSpecs);

// Done
console.log("✅ Rerun complete. Only latest reports retained.");
