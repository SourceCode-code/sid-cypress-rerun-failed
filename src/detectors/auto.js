const path = require("path");
const fs = require("fs");
const { getAllureFailedSpecs } = require("./allure");
const { getMochawesomeFailedSpecs } = require("./mochawesome");

function detectAndGetFailedSpecs({ reportDir, reporter }) {
  const baseDir = reportDir || path.join(process.cwd(), "cypress");

  if (reporter === "allure") return getAllureFailedSpecs(baseDir);
  if (reporter === "mochawesome") return getMochawesomeFailedSpecs(baseDir);

  // AUTO DETECT
  if (fs.existsSync(path.join(baseDir, "allure-results"))) {
    console.log("🔍 Detected Allure reports");
    return getAllureFailedSpecs(baseDir);
  }

  if (fs.existsSync(path.join(baseDir, "results"))) {
    console.log("🔍 Detected Mochawesome reports");
    return getMochawesomeFailedSpecs(baseDir);
  }

  throw new Error("No supported report format found");
}

module.exports = { detectAndGetFailedSpecs };
