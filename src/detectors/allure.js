const fs = require("fs");
const path = require("path");

function getAllureFailedSpecs(baseDir) {
  const dir = path.join(baseDir, "allure-results");
  const files = fs.readdirSync(dir).filter(f => f.endsWith("-result.json"));

  const failed = new Set();

  files.forEach(file => {
    const json = JSON.parse(fs.readFileSync(path.join(dir, file)));
    if (json.status === "failed") {
      const spec = json.fullName?.split(" ")[0];
      if (spec) failed.add(spec);
    }
  });

  return [...failed];
}

module.exports = { getAllureFailedSpecs };
