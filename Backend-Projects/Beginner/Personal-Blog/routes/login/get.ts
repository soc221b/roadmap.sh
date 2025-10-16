import type { Express } from "express";

const register = (app: Express) => {
  app.get("/login", async (req, res) => {
    res.render("login");
  });
};

export default register;
