import type { Express } from "express";
import cookie from "cookie";

const register = (app: Express) => {
  app.get("/", async (req, res) => {
    const cookies = cookie.parse(req.headers.cookie || "");
    if (cookies.Token) {
      res.redirect("/admin");
    } else {
      res.redirect("/home");
    }
  });
};

export default register;
