import type { Express } from "express";
import registerDelete from "./delete.ts";
import registerGet from "./get.ts";
import registerPost from "./post.ts";
import registerPut from "./put.ts";

const register = (app: Express) => {
  registerDelete(app);
  registerGet(app);
  registerPost(app);
  registerPut(app);
};

export default register;
