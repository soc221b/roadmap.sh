import type { Express } from "express";
import inject from "../../dependency-injection/index.ts";
import { AuthRepository } from "../../interfaces/auth-repository.ts";
import { createHeaders } from "../../utils/create-headers.ts";

const register = (app: Express) => {
  app.post("/logout", async (req, res) => {
    const authRepository = inject(AuthRepository);

    const headers = createHeaders(req, res);

    await authRepository.logout(headers);
    res.sendStatus(200);
  });
};

export default register;
