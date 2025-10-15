import { program } from "commander";
import { start } from "./start.ts";
import { connect } from "./connect.ts";

program
  .name("start")
  .command("start")
  .description("start the server")
  .action(() => {
    start();
  });

program
  .name("connect")
  .command("connect")
  .description("connect the client to the server")
  .requiredOption("--user <number>", "user name")
  .action((args) => {
    connect(args.user);
  });

program.parse();
