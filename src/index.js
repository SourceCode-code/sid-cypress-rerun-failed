const fs = require('fs');
const path = require('path');

function getFailedSpecs(reportDir) {
  if (!fs.existsSync(reportDir)) {
    throw new Error(`Report directory not found: ${reportDir}`);
  }

  const failedSpecs = new Set();
  const files = fs.readdirSync(reportDir).filter(f => f.endsWith('.json'));

  if (!files.length) {
    throw new Error('No JSON report files found in report directory');
  }

  for (const file of files) {
    const reportPath = path.join(reportDir, file);
    let report;

    try {
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch (err) {
      console.warn(`Skipping invalid JSON report: ${file}`);
      continue;
    }

    if (!report.results) continue;

    for (const result of report.results) {
      let hasFailure = false;

      (function walkSuites(suites = []) {
        for (const suite of suites) {
          suite.tests?.forEach(test => {
            if (test.state === 'failed') {
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

  return Array.from(failedSpecs);
}

/**
 * Cypress plugin entry point
 */
function cypressRerunFailed(on, config) {
  console.log('cypress-rerun-failed initialized');

  on('after:run', () => {
    const reportDir = path.join(
      config.projectRoot,
      'cypress',
      'results'
    );

    try {
      const failedSpecs = getFailedSpecs(reportDir);

      if (!failedSpecs.length) {
        console.log('No failed specs found');
        return;
      }

      const outputPath = path.join(
        config.projectRoot,
        'cypress',
        'failed-specs.json'
      );

      fs.writeFileSync(outputPath, JSON.stringify(failedSpecs, null, 2));
      console.log('Failed specs saved to:', outputPath);

    } catch (err) {
      console.warn('Failed spec detection skipped:', err.message);
    }
  });
}

module.exports = cypressRerunFailed;
module.exports.getFailedSpecs = getFailedSpecs;
