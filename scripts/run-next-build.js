const { spawn } = require("node:child_process");
const path = require("node:path");
const readline = require("node:readline");

const SUPPRESSED_WARNING_FRAGMENT =
  "[baseline-browser-mapping] The data in this module is over two months old.";

const nextBin = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "next.cmd" : "next",
);

const child = spawn(nextBin, ["build", ...process.argv.slice(2)], {
  env: {
    ...process.env,
    BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
  },
  stdio: ["inherit", "pipe", "pipe"],
});

const forwardStream = (input, output) => {
  const stream = readline.createInterface({ input });
  stream.on("line", (line) => {
    if (line.includes(SUPPRESSED_WARNING_FRAGMENT)) {
      return;
    }
    output.write(`${line}\n`);
  });
};

forwardStream(child.stdout, process.stdout);
forwardStream(child.stderr, process.stderr);

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("close", (code) => {
  process.exit(code ?? 1);
});
