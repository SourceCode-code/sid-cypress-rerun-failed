const { spawn } = require("child_process");

const MAX_SPECS_PER_RUN = 25; // Windows-safe

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function runCypress(specs, options) {
  const batches = chunkArray(specs, MAX_SPECS_PER_RUN);
  let hasFailure = false;

  for (let i = 0; i < batches.length; i++) {
    console.log(
      `\n🚀 Rerun batch ${i + 1}/${batches.length} (${batches[i].length} specs)`
    );

    try {
      await runSingleBatch(batches[i], options);
    } catch (err) {
      hasFailure = true;
      console.error(`❌ Batch ${i + 1} failed`);

      // Continue remaining batches
    }
  }

  if (hasFailure && !options.allowFail) {
    throw new Error("One or more rerun batches failed");
  }
}

function runSingleBatch(specBatch, options) {
  return new Promise((resolve, reject) => {
    const args = [
      "cypress",
      "run",
      "--spec",
      specBatch.map(s => `"${s}"`).join(","),
    ];

    if (options.browser) args.push("--browser", options.browser);
    if (options.headed) args.push("--headed");
    if (options.retries) args.push("--retries", String(options.retries));

    const child = spawn("npx", args, {
      stdio: "inherit",
      shell: true, // required on Windows
    });

    child.on("error", err =>
      reject(new Error(`Failed to start Cypress: ${err.message}`))
    );

    child.on("exit", code =>
      code === 0
        ? resolve()
        : reject(new Error(`Cypress exited with code ${code}`))
    );
  });
}

module.exports = { runCypress };
