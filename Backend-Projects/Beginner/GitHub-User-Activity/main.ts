import z from "zod/v4";
import issuesEventHandler from "./events/issues-event.ts";
import pushEventHandler from "./events/push-event.ts";
import watchEventHandler from "./events/watch-event.ts";

const username = process.argv[2];
if (username === undefined) {
  throw Error("Username is a required positional argument.");
}

const response = await fetch(
  `https://api.github.com/users/${username}/events?page=1&per_page=1`
);
if (response.status === 404) {
  throw Error("User doesn't exists");
}
const rateLimitSchema = z.object({
  message: z.string().startsWith("API rate limit"),
  documentation_url: z.string(),
});
const json = await response.json();
if (rateLimitSchema.safeParse(json).success) {
  console.error(json.message);
  process.exit(1);
}

const responses = await Promise.all(
  Array(10)
    .fill(null)
    .map(
      (_, i) => `https://api.github.com/users/${username}/events?page=${i + 1}`
    )
    .map((url) => fetch(url))
);
const events: unknown[] = await Promise.all(
  responses.map(async (response) => await response.json())
);
let chain: (event: unknown) => void = () => {};
chain = watchEventHandler(chain);
chain = issuesEventHandler(chain);
chain = pushEventHandler(chain);
events.map((event) => chain(event));

export {};
