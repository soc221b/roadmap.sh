const form = document.querySelector('form[id="update"]');
form
  .querySelector('button[type="submit"]')
  .addEventListener("click", async (e) => {
    if (form.checkValidity() === false) return;

    e.preventDefault();
    const formData = new FormData(form);
    await fetch(`/article/${formData.get("id")}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("title"),
        publishingDate: formData.get("publishingDate"),
        content: formData.get("content"),
      }),
    });
    location.replace(`/article/${formData.get("id")}`);
  });

const input = document.querySelector('input[name="publishingDate"]');
input.addEventListener("focus", function () {
  this.type = "date";
});
input.addEventListener("blur", function () {
  this.type = this.value ? "date" : "text";
});
