const fs = require("fs");
const path = require("path");

/* ----------------------------------
   Failed spec detection (robust)
----------------------------------- */
function getFailedSpecs(reportDir) {
  if (!fs.existsSync(reportDir)) {
    console.warn(`ℹ️ Report directory not found: ${reportDir}`);
    return [];
  }

  const files = fs.readdirSync(reportDir).filter(f => f.endsWith(".json"));
  if (!files.length) {
    console.warn("ℹ️ No JSON report files found");
    return [];
  }

  const failedSpecs = new Set();

  for (const file of files) {
    const reportPath = path.join(reportDir, file);
    let report;

    try {
      report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    } catch {
      console.warn(`⚠️ Skipping invalid JSON report: ${file}`);
      continue;
    }

    if (!report.results) continue;

    for (const result of report.results) {
      // ✅ Primary & most reliable check
      if (result.stats?.failures > 0 && result.file) {
        failedSpecs.add(result.file);
        continue;
      }

      // 🔁 Fallback: deep test scan (your original logic)
      let hasFailure = false;

      (function walkSuites(suites = []) {
        for (const suite of suites) {
          suite.tests?.forEach(test => {
            if (test.state === "failed") {
              hasFailure = true;
            }
          });
          walkSuites(suite.suites);
        }
      })(result.suites);

      if (hasFailure && result.file) {
        failedSpecs.add(result.file);
      }
    }
  }

  return [...failedSpecs];
}

/* ----------------------------------
   Cypress plugin entry point
----------------------------------- */
function cypressRerunFailed(on, config) {
  console.log("cypress-rerun-failed initialized");

  on("after:run", () => {
    const reportDir = path.join(
      config.projectRoot,
      "cypress",
      "results"
    );

    const failedSpecs = getFailedSpecs(reportDir);

    if (!failedSpecs.length) {
      console.log("✅ No failed specs detected");
      return;
    }

    const outputPath = path.join(
      config.projectRoot,
      "cypress",
      "failed-specs.json"
    );

    fs.writeFileSync(
      outputPath,
      JSON.stringify(failedSpecs, null, 2)
    );

    console.log("❌ Failed specs saved to:", outputPath);
  });
}

module.exports = cypressRerunFailed;
module.exports.getFailedSpecs = getFailedSpecs;
