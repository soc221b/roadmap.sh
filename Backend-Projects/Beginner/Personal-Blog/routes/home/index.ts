import type { Express } from "express";
import registerGet from "./get.ts";

const register = (app: Express) => {
  registerGet(app);
};

export default register;
