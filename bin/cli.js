#!/usr/bin/env node

const path = require("path");
const { rerunFailed } = require("../src");

const args = process.argv.slice(2);

function getArg(flag) {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
sid-cypress-rerun-failed

Usage:
  npx cypress-rerun-failed [options]

Options:
  --report-dir <path>   Report directory
  --reporter <type>     allure | mochawesome | auto (default)
  --browser <name>      chrome | firefox | edge
  --headed              Run in headed mode
  --retries <number>    Retry failed specs
  --dry-run             Print specs without executing
  --help, -h            Show help

Examples:
  npx cypress-rerun-failed
  npx cypress-rerun-failed --reporter allure
  npx cypress-rerun-failed --browser chrome --retries 2
`);
  process.exit(0);
}

(async () => {
  try {
    await rerunFailed({
      reportDir: getArg("--report-dir"),
      reporter: getArg("--reporter") || "auto",
      browser: getArg("--browser"),
      headed: args.includes("--headed"),
      retries: getArg("--retries"),
      dryRun: args.includes("--dry-run"),
    });
  } catch (err) {
    console.error("❌", err.message);
    process.exit(1);
  }
})();
