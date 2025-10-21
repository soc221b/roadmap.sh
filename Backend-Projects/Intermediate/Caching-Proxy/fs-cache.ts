import { writeFileSync, readFileSync, mkdirSync, rmdirSync } from "fs";
import { resolve } from "path";
import { ICache } from "./interface.ts";

export class FSCache extends ICache {
  private cacheDir: string = ".cache";

  async set(key: string, value: string): Promise<void> {
    mkdirSync(this.cacheDir, { recursive: true });
    writeFileSync(this.buildPath(key), value);
  }

  async get(key: string): Promise<string | undefined> {
    try {
      return readFileSync(this.buildPath(key), "utf-8");
    } catch {
      return undefined;
    }
  }

  async clear(): Promise<void> {
    rmdirSync(this.cacheDir, { recursive: true });
  }

  private buildPath(key: string): string {
    return resolve(
      import.meta.dirname,
      this.cacheDir,
      Buffer.from(key).toString("base64url")
    );
  }
}
