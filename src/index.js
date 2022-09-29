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

// Parses spark data from a http request using the given schema
async function parseData(req, schema) {
  const buf = await req.arrayBuffer();
  const pbf = new Pbf(new Uint8Array(buf));
  return schema.read(pbf);
}

export async function readFromBytebin(code, schema, extraHeaders) {
  const { SamplerData, HeapData } = schema;

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

  const type = req.headers.get("content-type");
  if (type === "application/x-spark-sampler") {
    return { ok: true, data: await parseData(req, SamplerData) };
  } else if (type === "application/x-spark-heap") {
    return { ok: true, data: await parseData(req, HeapData) };
  } else {
    return { ok: false, errorMsg: `unknown type: ${type}` };
  }
}
