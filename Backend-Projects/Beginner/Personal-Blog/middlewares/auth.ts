import type { RequestHandler } from "express";
import inject from "../dependency-injection/index.ts";
import { AuthRepository } from "../interfaces/auth-repository.ts";
import { createHeaders } from "../utils/create-headers.ts";

const authMiddleware: RequestHandler = async (req, res, next) => {
  const authRepository = inject(AuthRepository);

  const headers = createHeaders(req, res);

  const valid = await authRepository.verityAccessToken(headers);
  if (valid) {
    next();
  } else {
    await authRepository.logout(headers);
    res.sendStatus(401);
  }
};

export default authMiddleware;
