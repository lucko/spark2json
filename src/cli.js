import { loadSchema, readFromBytebin, parseSparkBuffer } from "./index.js";
import fs from "fs/promises";
import path from "path";

async function readInput(input, schema) {
  // Check if input is a file path
  let isFile = false;
  try {
    const stat = await fs.stat(input);
    isFile = stat.isFile();
  } catch (e) {
    isFile = false;
  }

  if (isFile) {
    try {
      const buffer = await fs.readFile(input);
      // Detect type from file extension
      const ext = path.extname(input).toLowerCase();
      let typeHeader;
      if (ext === ".sparkprofile") {
        typeHeader = "application/x-spark-sampler";
      } else if (ext === ".sparkheap") {
        typeHeader = "application/x-spark-heap";
      } else {
        throw new Error("Unknown file extension. Use .sparkprofile or .sparkheap");
      }
      const data = parseSparkBuffer(buffer, schema, true, typeHeader);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, errorMsg: "Failed to read or parse file: " + err.message };
    }
  } else {
    return await readFromBytebin(input, schema, {}, true);
  }
}

async function main() {
  if (process.argv.length != 3) {
    console.log("usage: node cli.js <code/path>");
    return;
  }

  const input = process.argv[2];
  const schema = await loadSchema();
  const { ok, data, errorMsg } = await readInput(input, schema);
  if (ok) {
    console.log(JSON.stringify(data));
  } else {
    console.error(errorMsg);
  }
}

(async () => {
  await main();
})();
