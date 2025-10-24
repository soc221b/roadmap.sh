import { type Request, type Response } from "express";
import { Cache } from "./interface.ts";
import { selectFactory } from "./factory.ts";

export const hit = async (
  req: Request,
  res: Response,
  cache: Cache
): Promise<boolean> => {
  const value = await cache.get(req.originalUrl);
  if (value === undefined) return false;

  res.setHeader("X-Cache", "HIT");
  const { mediaType, cacheValue } = JSON.parse(value);
  const factory = selectFactory(mediaType);
  await factory.send(res, cacheValue);
  return true;
};
