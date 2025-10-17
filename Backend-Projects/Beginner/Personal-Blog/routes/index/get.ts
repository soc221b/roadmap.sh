import type { Express } from "express";
import inject from "../../dependency-injection/index.ts";
import { AuthRepository } from "../../interfaces/auth-repository.ts";
import { createHeaders } from "../../utils/create-headers.ts";

const register = (app: Express) => {
  app.get("/", async (req, res) => {
    const authRepository = inject(AuthRepository);

    const headers = createHeaders(req, res);

    if (await authRepository.verify(headers)) {
      res.redirect("/admin");
    } else {
      res.redirect("/home");
    }
  });
};

export default register;
