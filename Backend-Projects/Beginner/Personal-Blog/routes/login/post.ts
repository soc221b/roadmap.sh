import type { Express } from "express";
import sanitizer from "sanitizer";
import inject from "../../dependency-injection/index.ts";
import { AuthRepository } from "../../interfaces/auth-repository.ts";
import { createHeaders } from "../../utils/create-headers.ts";

const register = (app: Express) => {
  app.post("/login", async (req, res) => {
    const authRepository = inject(AuthRepository);

    const headers = createHeaders(req, res);

    try {
      const user = {
        email: sanitizer.escape(req.body.email),
        password: sanitizer.escape(req.body.password),
      };
      await authRepository.login(user, headers);
      res.sendStatus(200);
    } catch {
      res.sendStatus(401);
    }
  });
};

export default register;
