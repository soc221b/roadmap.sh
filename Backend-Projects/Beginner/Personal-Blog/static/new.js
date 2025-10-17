const form = document.querySelector('form[id="publish"]');
form
  .querySelector('button[type="submit"]')
  .addEventListener("click", async (e) => {
    if (form.checkValidity() === false) return;

    e.preventDefault();
    const formData = new FormData(form);
    const response = await fetch(`/article`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("title"),
        publishingDate: formData.get("publishingDate"),
        content: formData.get("content"),
      }),
    });
    const json = await response.json();
    location.replace(`/article/${json.id}`);
  });

const input = document.querySelector('input[name="publishingDate"]');
input.addEventListener("focus", function () {
  this.type = "date";
});
input.addEventListener("blur", function () {
  this.type = this.value ? "date" : "text";
});
