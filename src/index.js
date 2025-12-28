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

function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  fs.readdirSync(dirPath).forEach(file => {
    fs.unlinkSync(path.join(dirPath, file));
  });
}

/* ----------------------------------
   Failed spec detection
----------------------------------- */
function getFailedSpecs(reportDir) {
  if (!fs.existsSync(reportDir)) {
    console.warn("Report directory does not exist");
    return [];
  }

  const files = fs.readdirSync(reportDir).filter(f => f.endsWith(".json"));
  if (!files.length) {
    console.warn("No JSON reports found");
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

      (function walk(suites = []) {
        for (const suite of suites) {
          suite.tests?.forEach(test => {
            if (test.state === "failed") hasFailure = true;
          });
          walk(suite.suites);
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
   Cypress plugin
----------------------------------- */
function cypressRerunFailed(on, config) {
  const resultsDir = path.join(config.projectRoot, "cypress", "results");
  const failedSpecsPath = path.join(
    config.projectRoot,
    "cypress",
    "failed-specs.json"
  );

  console.log("cypress-rerun-failed initialized");

  //  Fresh run cleanup
  on("before:run", () => {
    console.log("🧹 Fresh run: cleaning old reports & failed specs");
    cleanDirectory(resultsDir);
    safeDelete(failedSpecsPath);
  });

  //  Detect failures after run
  on("after:run", () => {
    const failedSpecs = getFailedSpecs(resultsDir);

    if (!failedSpecs.length) {
      console.log("No failed specs detected");
      return;
    }

    fs.writeFileSync(
      failedSpecsPath,
      JSON.stringify(failedSpecs, null, 2)
    );

    console.log("Failed specs saved:", failedSpecsPath);
  });
}

module.exports = cypressRerunFailed;
module.exports.getFailedSpecs = getFailedSpecs;
