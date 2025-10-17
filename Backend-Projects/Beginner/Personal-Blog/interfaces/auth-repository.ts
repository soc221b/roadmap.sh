import type { Headers } from "./headers.ts";
import type { User } from "./user.ts";

export abstract class AuthRepository {
  abstract login(user: User, headers: Headers): Promise<void>;

  abstract refreshAccessToken(headers: Headers): Promise<boolean>;

  abstract verityAccessToken(headers: Headers): Promise<boolean>;

  abstract logout(headers: Headers): Promise<void>;
}
