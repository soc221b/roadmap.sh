import type { Request, Response } from "express";
import type { Headers } from "../interfaces/headers.ts";

export const createHeaders: (req: Request, res: Response) => Headers = (
  req,
  res
) => {
  return {
    get: (name) => {
      return req.header(name);
    },
    set: (name, value) => {
      res.setHeader(name, value);
    },
  };
};
