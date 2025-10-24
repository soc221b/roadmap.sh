import { type Request, type Response } from "express";
import { Cache } from "./interface.ts";
import { selectFactory } from "./factory.ts";
import { getMediaType } from "./utils.ts";

export const miss = async (
  req: Request,
  res: Response,
  cache: Cache,
  origin: string
): Promise<void> => {
  const response = await fetch(origin + req.originalUrl);

  res.setHeader("X-Cache", "MISS");
  const mediaType = getMediaType(response.headers.get("Content-Type"));
  const factory = selectFactory(mediaType);
  const { cacheValue } = await factory.build(response);
  await factory.send(res, cacheValue);
  await cache.set(req.originalUrl, JSON.stringify({ mediaType, cacheValue }));
};
