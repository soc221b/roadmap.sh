import { type Response as ExpressResponse } from "express";

export abstract class Factory {
  abstract send(res: ExpressResponse, cacheValue: string): Promise<void>;

  abstract build(res: Response): Promise<{ cacheValue: string }>;
}

export abstract class Cache {
  abstract set(key: string, value: string): Promise<void>;

  abstract get(key: string): Promise<string | undefined>;

  abstract clear(): Promise<void>;
}
