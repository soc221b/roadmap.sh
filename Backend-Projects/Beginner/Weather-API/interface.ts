import { createClient } from "redis";

export type IRedisClient = ReturnType<typeof createClient>;

export abstract class IAPI {
  protected service: IService;
  protected redisClient: IRedisClient;

  constructor(service: IService, redisClient: IRedisClient) {
    this.service = service;
    this.redisClient = redisClient;
  }

  abstract get(): Promise<unknown>;
}

export abstract class IService {
  abstract get(location: string): Promise<unknown>;
}
