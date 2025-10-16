import type { Express } from "express";
import sanitizer from "sanitizer";
import cookie from "cookie";
import inject from "../../dependency-injection/index.ts";
import { AuthRepository } from "../../interfaces/auth-repository.ts";

const SIXTY_MINUTES = 10 * 60;

const register = (app: Express) => {
  app.post("/login", async (req, res) => {
    const authRepository = inject(AuthRepository);

    try {
      const { token } = await authRepository.login({
        email: sanitizer.escape(req.body.email),
        password: sanitizer.escape(req.body.password),
      });
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("Token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: SIXTY_MINUTES,
        })
      );

      res.sendStatus(200);
    } catch {
      res.sendStatus(401);
    }
  });
};

export default register;
