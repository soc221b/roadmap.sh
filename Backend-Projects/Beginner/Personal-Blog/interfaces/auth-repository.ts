import type { Headers } from "./headers.ts";
import type { User } from "./user.ts";

export abstract class AuthRepository {
  abstract login(user: User, headers: Headers): Promise<void>;

  abstract verify(headers: Headers): Promise<boolean>;

  abstract invalidate(headers: Headers): Promise<void>;
}
