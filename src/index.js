import fetch from "node-fetch";
import Pbf from "pbf";
import compile from "pbf/compile.js";
import schema from "protocol-buffers-schema";

// Loads, parses and compiles the spark protobuf schema.
export async function loadSchema() {
  const protoReq = await fetch(
    "https://raw.githubusercontent.com/lucko/spark-viewer/master/proto/spark.proto"
  );
  return compile(schema.parse(await protoReq.text()));
}

// Parses spark data from a buffer using the given schema and type
export function parseSparkBuffer(buffer, schema, full, typeHeader) {
  const { SamplerData, HeapData, SamplerDataLite, HeapDataLite, HealthDataLite } = schema;
  const pbf = new Pbf(new Uint8Array(buffer));
  if (typeHeader === "application/x-spark-sampler") {
    return { type: "sampler", ... (full ? SamplerData : SamplerDataLite).read(pbf) };
  } else if (typeHeader === "application/x-spark-heap") {
    return { type: "heap", ... (full ? HeapData : HeapDataLite).read(pbf) };
  } else if (typeHeader === "application/x-spark-health") {
    return { type: "health", ... HealthDataLite.read(pbf) };
  } else {
    return null;
  }
}

// Parses spark data from a http request using the given schema
async function parseData(req, schema, type) {
  const buf = await req.arrayBuffer();
  const pbf = new Pbf(new Uint8Array(buf));
  return {type, ...schema.read(pbf)}
}

export async function readFromBytebin(code, schema, extraHeaders, full) {
  const baseUrl = process.env.BYTEBIN_URL || "https://bytebin.lucko.me/";
  const req = await fetch(baseUrl + code, {
    headers: {
      "User-Agent": "spark2json",
      ...extraHeaders,
    },
  });
  if (!req.ok) {
    return { ok: false, errorMsg: `err: ${req.status} - ${req.statusText}` };
  }

  const typeHeader = req.headers.get("content-type");
  const buffer = await req.arrayBuffer();
  try {
    const data = parseSparkBuffer(buffer, schema, full, typeHeader);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, errorMsg: `parse error: ${err.message}` };
  }
}
