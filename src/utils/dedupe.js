const path = require("path");

function dedupeSpecs(specs) {
  return [
    ...new Set(
      specs.map(s => path.normalize(s))
    ),
  ];
}

module.exports = { dedupeSpecs };
