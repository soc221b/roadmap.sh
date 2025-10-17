import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../../interfaces/auth-repository.ts";
import type { User } from "../../interfaces/user.ts";
import type { Headers } from "../../interfaces/headers.ts";
import cookie from "cookie";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const ACCESS_TOKEN_COOKIE_NAME = "AccessToken";
const REFRESH_TOKEN_COOKIE_NAME = "RefreshToken";

const path = resolve(import.meta.dirname, "./refresh-tokens.json");

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

    const refreshToken = await this.generateRefreshToken();
    writeFileSync(
      path,
      JSON.stringify(
        JSON.parse(readFileSync(path, "utf8")).concat(refreshToken),
        null,
        2
      ),
      "utf8"
    );
    headers.set("Set-Cookie", [
      await this.generateRefreshTokenCookieValue(refreshToken),
      await this.generateAccessTokenCookieValue(
        await this.generateAccessToken()
      ),
    ]);
  }

  async refreshAccessToken(headers: Headers): Promise<boolean> {
    if ((await this.verityRefreshToken(headers)) === false) return false;

    headers.set(
      "Set-Cookie",
      await this.generateAccessTokenCookieValue(
        await this.generateAccessToken()
      )
    );
    return true;
  }

  async verityAccessToken(headers: Headers): Promise<boolean> {
    try {
      jwt.verify(
        cookie.parse(headers.get("Cookie"))[ACCESS_TOKEN_COOKIE_NAME],
        process.env.ACCESS_TOKEN_SECRET
      );
      return true;
    } catch {
      return false;
    }
  }

  async logout(headers: Headers): Promise<void> {
    const refreshToken = await this.getRefreshToken(headers);
    writeFileSync(
      path,
      JSON.stringify(
        JSON.parse(readFileSync(path, "utf8")).filter(
          (t) => t !== refreshToken
        ),
        null,
        2
      ),
      "utf8"
    );
    headers.set("Set-Cookie", [
      cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, "", {
        domain: "localhost",
        path: "/",
        expires: new Date(0),
      }),
      cookie.serialize(ACCESS_TOKEN_COOKIE_NAME, "", {
        domain: "localhost",
        path: "/",
        expires: new Date(0),
      }),
    ]);
  }

  private async generateRefreshTokenCookieValue(
    refreshToken: string
  ): Promise<string> {
    return cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 10 * 60 * 60 * 7,
    });
  }

  private async generateRefreshToken(): Promise<string> {
    return jwt.sign({}, process.env.REFRESH_TOKEN_SECRET);
  }

  private async generateAccessTokenCookieValue(
    accessToken: string
  ): Promise<string> {
    return cookie.serialize(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 20,
    });
  }

  private async generateAccessToken(): Promise<string> {
    return jwt.sign({}, process.env.ACCESS_TOKEN_SECRET);
  }

  private async verityRefreshToken(headers: Headers): Promise<boolean> {
    const refreshToken = await this.getRefreshToken(headers);

    if (JSON.parse(readFileSync(path, "utf8")).includes(refreshToken) === false)
      return false;

    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return false;
    }

    return true;
  }

  private async getRefreshToken(headers: Headers): Promise<string> {
    return cookie.parse(headers.get("Cookie"))[REFRESH_TOKEN_COOKIE_NAME];
  }
}
