import { loadSchema, readFromBytebin } from "./index.js";

async function main() {
  if (process.argv.length != 3) {
    console.log("usage: node cli.js <code>");
    return;
  }

  const schema = await loadSchema();
  const { ok, data, errorMsg } = await readFromBytebin(
    process.argv[2],
    schema,
    {},
    true
  );

  if (ok) {
    console.log(JSON.stringify(data));
  } else {
    console.error(errorMsg);
  }
}

(async () => {
  await main();
})();
