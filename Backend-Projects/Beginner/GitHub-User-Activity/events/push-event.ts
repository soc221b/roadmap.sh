import z from "zod/v4";
import type { Handler } from "../interface/handler.ts";

const schema = z.object({
  type: z.literal("PushEvent"),
  payload: z.object({
    size: z.number(),
  }),
  repo: z.object({
    name: z.string(),
  }),
});

const handler: Handler = (next) => (event) => {
  const result = schema.safeParse(event);
  if (result.success) {
    console.log(
      `- Pushed ${
        1 < result.data.payload.size
          ? result.data.payload.size + "commits"
          : "a commit"
      } to ${result.data.repo.name}`
    );
  } else {
    next(event);
  }
};

export default handler;
