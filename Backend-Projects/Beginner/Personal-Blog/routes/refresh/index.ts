import type { Express } from "express";
import registerPost from "./post.ts";

const register = (app: Express) => {
  registerPost(app);
};

export default register;
