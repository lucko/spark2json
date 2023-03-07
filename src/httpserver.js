import { loadSchema, readFromBytebin } from "./index.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { JSONPath } from "jsonpath-plus";

async function main() {
  const schema = await loadSchema();

  const app = express();
  app.use(morgan("dev"));
  app.use(cors());
  app.disable("x-powered-by");
  app.enable("trust proxy");

  app.get("/:code", async (req, res) => {
    let extraHeaders = {};
    if (process.env.BYTEBIN_API_KEY) {
      extraHeaders = {
        "Bytebin-Api-Key": process.env.BYTEBIN_API_KEY,
        "Bytebin-Forwarded-For": req.ip,
      };
    }

    const full = !!req.query.full || req.query.full == "1";
    const { ok, data, errorMsg } = await readFromBytebin(
      req.params.code,
      schema,
      extraHeaders,
      full
    );

    if (ok) {
      try {
        if (req.query.path) {
          const result = new JSONPath({
            path: req.query.path,
            json: data,
            wrap: false,
            preventEval: true,
          });
          res.send(result);
        } else {
          res.send(data);
        }
      } catch (e) {
        console.error(e);
        res.status(400).send("server error");
      }
    } else {
      res.status(400).send(errorMsg);
    }
  });

  const port = 3000;
  const server = app.listen(port, () => {
    console.log("listening on port " + port);
  });

  function stop() {
    console.log("shutdown signal received, stopping server");
    server.close(() => {
      console.log("bye!");
    });
  }

  process.on("SIGTERM", () => stop());
  process.on("SIGINT", () => stop());
}

(async () => {
  await main();
})();
