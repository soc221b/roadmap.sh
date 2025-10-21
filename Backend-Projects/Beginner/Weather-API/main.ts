import { IAPI, IService } from "./interface.ts";
import { API } from "./api.ts";
import { Service } from "./service.ts";
import { createClient } from "redis";

const redisClient = createClient({
  RESP: 3,
  clientSideCache: {
    ttl: 60,
    maxEntries: 0, // Maximum entries (0 = unlimited)
    evictPolicy: "LRU", // Eviction policy: "LRU" or "FIFO"
  },
});
const service: IService = new Service();
const api: IAPI = new API(service, redisClient);

const data = await api.get();
console.log(data);
redisClient.close();
