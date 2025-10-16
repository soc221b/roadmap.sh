import type { Express } from "express";
import registerGet from "./get.ts";
import registerPost from "./post.ts";

const register = (app: Express) => {
  registerGet(app);
  registerPost(app);
};

export default register;
