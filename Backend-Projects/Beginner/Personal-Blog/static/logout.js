document
  .querySelector('form[id="logout"] button[type="submit"]')
  .addEventListener("click", async (e) => {
    e.preventDefault();

    await fetch(`/logout`, { method: "POST" });
    location.replace("/home");
  });
