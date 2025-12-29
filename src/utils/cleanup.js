const fs = require("fs");
const path = require("path");

function cleanupBeforeRerun({ reportDir, reporter }) {
  const baseDir = reportDir || path.join(process.cwd(), "cypress");

  // ✅ Mochawesome cleanup
  if (reporter === "mochawesome" || reporter === "auto") {
    const resultsDir = path.join(baseDir, "results");

    if (fs.existsSync(resultsDir)) {
      fs.readdirSync(resultsDir).forEach(file => {
        // 🔥 THIS IS THE KEY FIX
        if (file.startsWith("fail_") && file.endsWith(".json")) {
          fs.unlinkSync(path.join(resultsDir, file));
          console.log(`🗑️ Deleted old failure report: ${file}`);
        }
      });
    }
  }

  // ✅ Allure cleanup (safe to delete all results)
  if (reporter === "allure" || reporter === "auto") {
    const allureDir = path.join(baseDir, "allure-results");

    if (fs.existsSync(allureDir)) {
      fs.readdirSync(allureDir).forEach(file => {
        if (file.endsWith(".json")) {
          fs.unlinkSync(path.join(allureDir, file));
        }
      });
      console.log("🗑️ Deleted old Allure result files");
    }
  }
}

module.exports = { cleanupBeforeRerun };
