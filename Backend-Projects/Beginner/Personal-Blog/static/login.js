document
  .querySelector('form[id="login"] button[type="submit"]')
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = new FormData(document.querySelector('form[id="login"]'));
    const response = await fetch(`/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    if (response.ok) {
      location.replace(`/admin`);
    } else if (response.status === 401) {
      alert("Invalid email or password");
    } else {
      // Report to server
    }
  });
