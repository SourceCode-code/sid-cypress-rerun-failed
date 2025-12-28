const fs = require("fs");
const path = require("path");

/* ----------------------------------
   Helpers
----------------------------------- */
function safeDelete(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Delete only report files that belong to failed specs
 */
function deleteReportsForFailedSpecs(reportDir, failedSpecs) {
  if (!fs.existsSync(reportDir)) return;

  const reportFiles = fs.readdirSync(reportDir).filter(f =>
    f.endsWith(".json")
  );

  for (const file of reportFiles) {
    const reportPath = path.join(reportDir, file);

    try {
      const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      if (!report.results) continue;

      for (const result of report.results) {
        if (failedSpecs.includes(result.file)) {
          fs.unlinkSync(reportPath);
          console.log(` Deleted stale report: ${file}`);
          break;
        }
      }
    } catch {
      // ignore invalid JSON
    }
  }
}

/* ----------------------------------
   Failed spec detection
----------------------------------- */
function getFailedSpecs(reportDir) {
  if (!fs.existsSync(reportDir)) {
    console.warn(" Report directory does not exist");
    return [];
  }

  const files = fs.readdirSync(reportDir).filter(f =>
    f.endsWith(".json")
  );

  if (!files.length) {
    console.warn(" No JSON reports found");
    return [];
  }

  const failedSpecs = new Set();

  for (const file of files) {
    let report;

    try {
      report = JSON.parse(
        fs.readFileSync(path.join(reportDir, file), "utf8")
      );
    } catch {
      continue;
    }

    if (!report.results) continue;

    for (const result of report.results) {
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
   Cypress plugin entry
----------------------------------- */
function cypressRerunFailed(on, config) {
  const resultsDir = path.join(config.projectRoot, "cypress", "results");
  const failedSpecsPath = path.join(
    config.projectRoot,
    "cypress",
    "failed-specs.json"
  );

  console.log("cypress-rerun-failed initialized");

  /**
   * AFTER RUN:
   * - detect failed specs
   * - delete ONLY stale reports for failed specs
   * - save failed-specs.json
   */
  on("after:run", () => {
    const failedSpecs = getFailedSpecs(resultsDir);

    if (!failedSpecs.length) {
      console.log(" No failed specs detected");
      safeDelete(failedSpecsPath); // clean old failures
      return;
    }

    //  delete only reports for failed specs
    deleteReportsForFailedSpecs(resultsDir, failedSpecs);

    fs.writeFileSync(
      failedSpecsPath,
      JSON.stringify(failedSpecs, null, 2)
    );

    console.log(" Failed specs saved:", failedSpecsPath);
  });
}

module.exports = cypressRerunFailed;
module.exports.getFailedSpecs = getFailedSpecs;
