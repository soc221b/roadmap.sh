export abstract class Cache {
  abstract set(key: string, value: string): Promise<void>;

  abstract get(key: string): Promise<string | undefined>;

  abstract clear(): Promise<void>;
}
