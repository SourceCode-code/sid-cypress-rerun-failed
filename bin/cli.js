#!/usr/bin/env node

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { getFailedSpecs } = require("../src");


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
  --browser <name>     Run in specific browser (chrome, firefox, edge)
  --headed             Run Cypress in headed mode
  --retries <number>   Retry failed specs
  --help, -h           Show this help message

Examples:
  npx cypress-rerun-failed
  npx cypress-rerun-failed --browser chrome
  npx cypress-rerun-failed --headed --retries 2
`);
  process.exit(0);
}

// --------------------
// SUPPORTED FLAGS
// --------------------
const browser = getArg("--browser");
const headed = args.includes("--headed");
const retries = getArg("--retries");

// --------------------
// CONFIG
// --------------------
const REPORT_DIR = path.join(process.cwd(), "cypress", "results");

try {
  console.log("Searching for failed spec files...");

  if (!fs.existsSync(REPORT_DIR)) {
    throw new Error(`Report directory not found: ${REPORT_DIR}`);
  }

  const failedSpecs = getFailedSpecs(REPORT_DIR);

  if (!failedSpecs.length) {
    console.log("No failed spec files found");
    process.exit(0);
  }

  console.log("Failed spec files:");
  failedSpecs.forEach((spec) => console.log(` - ${spec}`));

  const spawnArgs = [
    "cypress",
    "run",
    "--spec",
    failedSpecs.join(","),
  ];

  if (browser) spawnArgs.push("--browser", browser);
  if (headed) spawnArgs.push("--headed");
  if (retries) spawnArgs.push("--retries", retries);

  console.log("Rerunning failed spec files...\n");

  const result = spawnSync("npx", spawnArgs, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  process.exit(result.status ?? 0);
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
