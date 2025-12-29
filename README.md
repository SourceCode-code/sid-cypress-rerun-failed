# ⭐ cypress-rerun-failed-specs-sid-g

A Cypress CLI utility that reruns only failed spec files from the previous Cypress run.

Designed to reduce flaky failures, save CI time, and avoid rerunning the entire test suite — without abusing Cypress internals.

## ✨ Key Features

✅ Reruns only failed spec files

✅ Works with Mochawesome & Allure

✅ Cleans duplicate failure reports

✅ Handles spaces in spec filenames

✅ Scales to large test suites (Windows-safe batching)

✅ CI-friendly with controlled exit codes

✅ Zero Cypress configuration changes required

## ❓ What problem does this solve?

In real-world Cypress projects:

Tests can be flaky

CI pipelines fail even though reruns would pass

Rerunning the entire suite is slow and costly

✅ This tool solves that by:

Detecting failed spec files from reports

Cleaning old failure artifacts

Rerunning only those specs

Producing clean, deduplicated reports

## 📦 Installation

Install as a dev dependency:
```bash
npm install --save-dev cypress-rerun-failed-specs-sid-g
```

Node.js ≥ 16 required

## ⚠️ Important Usage Note (Read This)

🚫 Do NOT import this package in cypress.config.js
🚫 Do NOT call it from setupNodeEvents

✅ This tool runs outside Cypress, as a CLI.

This is intentional and required to avoid Cypress recursion and crashes.

## ▶️ Basic Usage
Step 1: Run Cypress normally
```bash
npx cypress run
```

This generates reporter output (e.g. Mochawesome / Allure).

Step 2: Rerun only failed specs
```bash
npx cypress-rerun-failed
```

Only the failed spec files from the previous run are executed.

🔍 Dry Run (No Execution)

Preview failed specs without running Cypress:
```bash
npx cypress-rerun-failed --dry-run
```
🧹 Cleanup Strategies

Control how old report files are cleaned before rerun.

Delete only old failed reports (default)
```bash
npx cypress-rerun-failed --cleanup-strategy=fail
```
Delete all report files
```bash
npx cypress-rerun-failed --cleanup-strategy=all
```
Do not delete any report files
```bash
npx cypress-rerun-failed --cleanup-strategy=none
```
## 🧪 Browser & Mode Options

Headed mode
```bash
npx cypress-rerun-failed --headed
```

Specific browser
```bash
npx cypress-rerun-failed --browser chrome
npx cypress-rerun-failed --browser edge
npx cypress-rerun-failed --browser firefox
```

🔁 Retry Failed Specs

Retry failed specs during rerun:
```bash
npx cypress-rerun-failed --retries 1
npx cypress-rerun-failed --retries 2
```
🧯 CI-Safe Mode (Allow Failures)

Prevent CI from failing even if rerun tests still fail:
```bash
npx cypress-rerun-failed --allow-fail
```
Recommended CI pattern
```bash
npx cypress run || npx cypress-rerun-failed --allow-fail
```

📊 Reporter Support

Auto-detect reporter (default)
```bash
npx cypress-rerun-failed --reporter auto
```

Force Mochawesome
```bash
npx cypress-rerun-failed --reporter mochawesome
```
Force Allure
```bash
npx cypress-rerun-failed --reporter allure
```
⚙️ Large Test Suites (Batch Reruns)

For large suites, reruns are automatically batched to avoid OS command-length limits (especially on Windows).

No configuration required — batching is automatic.
```bash
npx cypress-rerun-failed
```
🤖 CI Examples
GitHub Actions / Jenkins
```bash
npx cypress run || npx cypress-rerun-failed --allow-fail
```
Generate Mochawesome report after rerun
```bash
npx mochawesome-merge cypress/results/*.json -o output.json
npx marge output.json
```

## 📂 Generated Files
Path	Description
```bash
cypress/results/*.json	Reporter output (Mochawesome)
cypress/allure-results/*	Allure results
.cypress-rerun-state.json	Temporary internal state (auto-cleaned)
```

## 🛡️ Why this tool is safe

Auto-rerun is explicit & opt-in

No Cypress monkey-patching

No infinite rerun loops

No network calls

No postinstall scripts

Cross-platform (Windows / macOS / Linux)

## 🏆 Summary
Capability	Supported
Rerun failed specs only	✅
Cleanup duplicate reports	✅
CI-safe execution	✅
Large test suites	✅
Mochawesome & Allure	✅
Windows compatibility	✅
📄 License

MIT

👤 Author

Siddhant Gadakh
QA Automation Engineer | Cypress | Node.js | CI Optimization