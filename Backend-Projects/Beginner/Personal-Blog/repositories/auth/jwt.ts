import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../../interfaces/auth-repository.ts";
import type { User } from "../../interfaces/user.ts";
import type { Headers } from "../../interfaces/headers.ts";
import cookie from "cookie";

const AUTH_COOKIE_NAME = "Token";

export class JWTAuthRepository implements AuthRepository {
  private users: User[] = [
    {
      email: "user@example.com",
      password: "$2b$10$4vh/xfa5vBBAErqKvXFDCekWcBzT2Yp98Q2DrEY2R0xr0rxb2htNi",
    },
  ];

  async login(user: User, headers: Headers): Promise<void> {
    const hash = this.users.find((u) => u.email === user.email)?.password;
    if (hash === undefined) throw Error();

    const result = bcrypt.compareSync(user.password, hash);
    if (result === false) throw Error();

    headers.set(
      "Set-Cookie",
      cookie.serialize(AUTH_COOKIE_NAME, jwt.sign({}, process.env.SECRET), {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 10 * 60,
      })
    );
  }

  async verify(headers: Headers): Promise<boolean> {
    try {
      jwt.verify(
        cookie.parse(headers.get("Cookie"))[AUTH_COOKIE_NAME],
        process.env.SECRET
      );
      return true;
    } catch {
      return false;
    }
  }

  async invalidate(headers: Headers): Promise<void> {
    headers.set(
      "Set-Cookie",
      cookie.serialize(AUTH_COOKIE_NAME, "", {
        domain: "localhost",
        path: "/",
        expires: new Date(0),
      })
    );
  }
}
