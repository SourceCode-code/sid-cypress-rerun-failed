const fs = require("fs");
const path = require("path");

function getFailedSpecs(reportDir) {
  if (!fs.existsSync(reportDir)) return [];

  const files = fs.readdirSync(reportDir).filter(f => f.endsWith(".json"));
  if (!files.length) return [];

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
      if (result.stats?.failures > 0 && result.file) {
        failedSpecs.add(result.file);
      }
    }
  }

  return [...failedSpecs];
}

function cypressRerunFailed(on, config) {
  const resultsDir = path.join(config.projectRoot, "cypress", "results");
  const failedSpecsPath = path.join(
    config.projectRoot,
    "cypress",
    "failed-specs.json"
  );

  on("after:run", () => {
    const failedSpecs = getFailedSpecs(resultsDir);

    if (!failedSpecs.length) {
      console.log("✅ No failed specs detected");
      return;
    }

    fs.writeFileSync(
      failedSpecsPath,
      JSON.stringify(failedSpecs, null, 2)
    );

    console.log("❌ Failed specs detected:", failedSpecs);
  });
}

module.exports = cypressRerunFailed;
module.exports.getFailedSpecs = getFailedSpecs;
