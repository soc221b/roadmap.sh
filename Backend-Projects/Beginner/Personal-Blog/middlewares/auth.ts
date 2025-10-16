import type { RequestHandler } from "express";
import cookie from "cookie";
import jwt from "jsonwebtoken";

const authMiddleware: RequestHandler = (req, res, next) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  try {
    jwt.verify(cookies.Token ?? "", process.env.SECRET);
    next();
  } catch {
    res.clearCookie("Token");
    res.sendStatus(401);
  }
};

export default authMiddleware;
