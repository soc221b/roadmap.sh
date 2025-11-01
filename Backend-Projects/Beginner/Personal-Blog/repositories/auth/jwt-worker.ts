import { parentPort } from "worker_threads";
import bcrypt from "bcrypt";

parentPort.on("message", (message) => {
  parentPort.postMessage(bcrypt.compareSync(message.password, message.hash));
});
