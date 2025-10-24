import WebSocket, { WebSocketServer } from "ws";
import { HEARTBEAT_INTERVAL } from "./constant.ts";

export function start() {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", (data) => {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });
  });

  wss.on("close", () => {
    clearInterval(interval);
  });
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isWaitingPong) {
        delete ws.isWaitingPong;
        ws.terminate();
        return;
      }

      ws.isWaitingPong = true;
      ws.once("pong", function () {
        delete this.isWaitingPong;
      });
      ws.ping();
    });
  }, HEARTBEAT_INTERVAL / 2);
}

declare module "ws" {
  interface WebSocket {
    isWaitingPong?: true;
  }
}
