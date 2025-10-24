import { program } from "commander";
import express from "express";
import { Cache } from "./interface.ts";
import { FSCache } from "./cache.ts";
import { hit } from "./hit.ts";
import { miss } from "./miss.ts";

program
  .option(
    "-p, --port <number>",
    "the port on which the caching proxy server will run",
    "3000"
  )
  .option(
    "-o, --origin <string>",
    "the URL of the server to which the requests will be forwarded"
  )
  .option("-c, --clear-cache", "clear the cache")
  .parse();

const options = program.opts();

const cache: Cache = new FSCache();

if (options.clearCache) {
  await cache.clear();
} else {
  const app = express();

  app.get("{*splat}", async (req, res) => {
    if (await hit(req, res, cache)) {
      return;
    } else {
      await miss(req, res, cache, options.origin);
    }
  });

  app.listen(options.port, "localhost", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(
        `Caching proxy server is running on http://localhost:${options.port}`
      );
    }
  });
}
