const { detectAndGetFailedSpecs } = require("./detectors/auto");
const { runCypress } = require("./runner");
const { dedupeSpecs } = require("./utils/dedupe");
const { printSummary } = require("./utils/summary");
const { cleanupBeforeRerun } = require("./utils/cleanup");

async function rerunFailed(options = {}) {
  let failedSpecs = detectAndGetFailedSpecs(options);
  failedSpecs = dedupeSpecs(failedSpecs);

  if (!failedSpecs.length) {
    console.log("✅ No failed specs found");
    return;
  }
 
  // 🔥 MUST happen BEFORE rerun
 cleanupBeforeRerun(options);

  console.log("❌ Failed specs:");
  failedSpecs.forEach((s) => console.log(` - ${s}`));

  if (options.dryRun) {
    console.log("\n🧪 Dry run enabled. Exiting.");
    printSummary(failedSpecs, options, true);
    return;
  }

  await runCypress(failedSpecs, options);
  printSummary(failedSpecs, options);
}

module.exports = { rerunFailed };
