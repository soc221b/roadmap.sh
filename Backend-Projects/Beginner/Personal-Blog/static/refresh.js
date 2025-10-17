let cancelled = false;
async function refresh() {
  if (cancelled) return;
  const response = await fetch(`/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
  } else if (response.status === 401) {
    alert("Session expired");
    return;
  } else {
    // Report to server
    return;
  }
  await sleep(10_000);
  refresh();
}
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

refresh();
window.addEventListener("beforeunload", () => {
  cancelled = true;
});
