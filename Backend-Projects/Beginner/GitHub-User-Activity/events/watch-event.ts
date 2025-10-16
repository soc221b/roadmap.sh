import z from "zod/v4";
import type { Handler } from "../interface/handler.ts";

const schema = z.object({
  type: z.literal("WatchEvent"),
  payload: z.object({
    action: z.literal("started"),
  }),
  repo: z.object({
    name: z.string(),
  }),
});

const handler: Handler = (next) => (event) => {
  const result = schema.safeParse(event);
  if (result.success) {
    console.log(`- Starred ${result.data.repo.name}`);
  } else {
    next(event);
  }
};

export default handler;
