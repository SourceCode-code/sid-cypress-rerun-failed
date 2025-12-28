const fs = require("fs");
const path = require("path");

/* ----------------------------------
   Helpers
----------------------------------- */
function safeDelete(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🧹 Removed stale file: ${filePath}`);
  }
}

/* ----------------------------------
   Failed spec detection (robust)
----------------------------------- */
function getFailedSpecs(reportDir) {
  if (!fs.existsSync(reportDir)) {
    console.warn(` Report directory not found: ${reportDir}`);
    return [];
  }

  const files = fs.readdirSync(reportDir).filter(f => f.endsWith(".json"));
  if (!files.length) {
    console.warn(" No JSON report files found");
    return [];
  }

  const failedSpecs = new Set();

  for (const file of files) {
    const reportPath = path.join(reportDir, file);
    let report;

    try {
      report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    } catch {
      console.warn(` Skipping invalid JSON report: ${file}`);
      continue;
    }

    if (!report.results) continue;

    for (const result of report.results) {
      //  Primary (most reliable)
      if (result.stats?.failures > 0 && result.file) {
        failedSpecs.add(result.file);
        continue;
      }

      // Fallback (deep scan)
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

  const resultsDir = path.join(
    config.projectRoot,
    "cypress",
    "results"
  );

  const failedSpecsPath = path.join(
    config.projectRoot,
    "cypress",
    "failed-specs.json"
  );

  //  Fresh Cypress run → clean stale failed-specs.json
  on("before:run", () => {
    safeDelete(failedSpecsPath);
  });

  //  After run → detect failures & save
  on("after:run", () => {
    const failedSpecs = getFailedSpecs(resultsDir);

    if (!failedSpecs.length) {
      console.log(" No failed specs detected");
      return;
    }

    fs.writeFileSync(
      failedSpecsPath,
      JSON.stringify(failedSpecs, null, 2)
    );

    console.log(" Failed specs saved to:", failedSpecsPath);
  });
}

module.exports = cypressRerunFailed;
module.exports.getFailedSpecs = getFailedSpecs;
