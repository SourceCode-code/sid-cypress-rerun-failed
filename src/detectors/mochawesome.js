const fs = require("fs");
const path = require("path");

function getMochawesomeFailedSpecs(baseDir) {
  const dir = path.join(baseDir, "results");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

  const failed = new Set();

  files.forEach(file => {
    const json = JSON.parse(fs.readFileSync(path.join(dir, file)));
    json.results?.forEach(r => {
      r.suites?.forEach(s => {
        s.tests?.forEach(t => {
          if (t.fail) failed.add(r.file);
        });
      });
    });
  });

  return [...failed];
}

module.exports = { getMochawesomeFailedSpecs };
