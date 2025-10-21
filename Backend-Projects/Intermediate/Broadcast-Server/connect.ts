import WebSocket from "ws";
import { HEARTBEAT_INTERVAL } from "./constant.ts";
import readline from "readline";

export function connect(user: string) {
  const client = new WebSocket("ws://localhost:8080/", {
    handshakeTimeout: 1000,
  });
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const query = `${user}: `;

  client.on("error", console.error);

  client.on("open", async () => {
    read();

    function read() {
      rl.question(query, (text) => {
        client.send(JSON.stringify({ user, text }));
        read();
      });
    }
  });

  client.on("message", (data) => {
    const parsed = JSON.parse(
      Buffer.from(data as unknown as string).toString()
    );
    readline.moveCursor(process.stdout, -1 * query.length, 0);
    console.log(`${parsed.user}: ${parsed.text}`);
    console.log(`${user}: `);
    readline.moveCursor(process.stdout, query.length, -1);
  });

  client.on("ping", function heartbeat() {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      this.terminate();
    }, HEARTBEAT_INTERVAL);
  });

  client.on("close", function clear() {
    clearTimeout(this.pingTimeout);
    console.log("\nserver terminated");
    process.exit(0);
  });
}

declare module "ws" {
  interface WebSocket {
    pingTimeout?: NodeJS.Timeout;
  }
}
