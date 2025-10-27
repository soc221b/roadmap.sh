const form = document.querySelector("form");
const label = document.querySelector("label");
const user = document.querySelector("input[name='user']");
const message = document.querySelector("input[name='message']");
const pre = document.querySelector("pre");
const socket = new WebSocket("ws://localhost:8080/ws");

socket.onopen = function () {
  pre.textContent += "Status: Connected\n";
};

socket.onmessage = function (e) {
  pre.textContent += e.data + "\n";
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  socket.send(user.value + ": " + message.value);
  message.value = "";
});
