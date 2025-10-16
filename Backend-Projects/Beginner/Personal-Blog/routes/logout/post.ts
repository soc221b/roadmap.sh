import type { Express } from "express";
import authMiddleware from "../../middlewares/auth.ts";

const register = (app: Express) => {
  app.post("/logout", async (req, res) => {
    res.clearCookie("Token", { domain: "localhost", path: "/" });
    res.sendStatus(200);
  });
};

export default register;
