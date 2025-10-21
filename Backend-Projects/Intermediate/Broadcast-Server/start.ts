import WebSocket, { WebSocketServer } from "ws";
import { HEARTBEAT_INTERVAL } from "./constant.ts";

export function start() {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", function message(data) {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });

    ws.isAlive = true;
    ws.on("pong", function heartbeat() {
      this.isAlive = true;
    });
  });
  wss.on("close", () => {
    clearInterval(interval);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, HEARTBEAT_INTERVAL / 2);
}

declare module "ws" {
  interface WebSocket {
    isAlive: boolean;
  }
}
