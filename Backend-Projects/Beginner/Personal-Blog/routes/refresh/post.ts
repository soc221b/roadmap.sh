import type { Express } from "express";
import inject from "../../dependency-injection/index.ts";
import { AuthRepository } from "../../interfaces/auth-repository.ts";
import { createHeaders } from "../../utils/create-headers.ts";

const register = (app: Express) => {
  app.post("/refresh", async (req, res) => {
    const authRepository = inject(AuthRepository);

    const headers = createHeaders(req, res);

    if (await authRepository.refreshAccessToken(headers)) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  });
};

export default register;
