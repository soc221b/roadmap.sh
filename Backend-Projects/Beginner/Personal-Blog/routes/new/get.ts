import type { Express } from "express";
import authMiddleware from "../../middlewares/auth.ts";

const register = (app: Express) => {
  app.get("/new", authMiddleware, async (req, res) => {
    res.render("new");
  });
};

export default register;
