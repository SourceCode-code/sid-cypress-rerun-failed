function printSummary(specs, options, dryRun = false) {
  const summary = {
    rerunSpecsCount: specs.length,
    browser: options.browser || "default",
    reporter: options.reporter || "auto",
    retries: options.retries || 0,
    dryRun,
  };

  console.log("\n📊 RERUN SUMMARY");
  console.log("------------------");
  console.log(`Specs rerun : ${summary.rerunSpecsCount}`);
  console.log(`Browser     : ${summary.browser}`);
  console.log(`Reporter    : ${summary.reporter}`);
  console.log(`Retries     : ${summary.retries}`);
  console.log(`Dry run     : ${summary.dryRun}`);

  // CI-friendly JSON output
  if (process.env.CI) {
    console.log("\n::rerun-summary::");
    console.log(JSON.stringify(summary, null, 2));
  }
}

module.exports = { printSummary };
