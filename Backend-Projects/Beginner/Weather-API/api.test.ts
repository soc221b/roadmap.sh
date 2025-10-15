import { API } from "./api.ts";
import { IAPI, IRedisClient, IService } from "./interface.ts";
import { it, expect, vi, beforeEach } from "vitest";

const service: IService = {
  get: vi.fn(),
};

const redisClient: IRedisClient = {
  connect: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
} as unknown as IRedisClient;

beforeEach(() => {
  vi.clearAllMocks();
});

it("should fetch weather data from the service if there is no cached data", async () => {
  const api: IAPI = new API(service, redisClient);
  service.get = vi.fn().mockResolvedValue(Promise.resolve({ temp: 30 }));
  (redisClient as any).get = vi.fn().mockResolvedValue(Promise.resolve(null));

  await api.get();

  expect(service.get).toHaveBeenCalledTimes(1);
  expect(redisClient.get).toHaveBeenCalledTimes(1);
  expect(redisClient.set).toHaveBeenCalledTimes(1);
  expect(redisClient.set).toHaveBeenCalledWith(
    "Taipei",
    JSON.stringify({ temp: 30 }),
    { EX: 5 }
  );
});

it("should use cache if there is cached data", async () => {
  const api: IAPI = new API(service, redisClient);
  (redisClient as any).get = vi
    .fn()
    .mockResolvedValueOnce(Promise.resolve(JSON.stringify({ temp: 30 })));

  const response = await api.get();

  expect(service.get).toHaveBeenCalledTimes(0);
  expect(redisClient.get).toHaveBeenCalledTimes(1);
  expect(response).toEqual({ temp: 30 });
});
