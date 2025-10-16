import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../interfaces/auth-repository.ts";
import type { User } from "../interfaces/user.ts";

export class JWTAuthRepository implements AuthRepository {
  private users: User[] = [
    {
      email: "user@example.com",
      password: "$2b$10$4vh/xfa5vBBAErqKvXFDCekWcBzT2Yp98Q2DrEY2R0xr0rxb2htNi",
    },
  ];

  async login(user: {
    email: string;
    password: string;
  }): Promise<{ token: string }> {
    const hash = this.users.find((u) => u.email === user.email)?.password;
    if (hash === undefined) throw Error();

    const result = bcrypt.compareSync(user.password, hash);
    if (!result) throw Error();

    const token = jwt.sign({}, process.env.SECRET);
    return { token };
  }
}
