import { IAPI } from "./interface.ts";

export class API extends IAPI {
  async get(): Promise<unknown> {
    await this.redisClient.connect();
    const location = "Taipei";
    const cache = await this.redisClient.get(location);
    if (cache) {
      return JSON.parse(cache);
    }

    const data = await this.service.get(location);
    await this.redisClient.set(location, JSON.stringify(data), { EX: 5 });
    return data;
  }
}
