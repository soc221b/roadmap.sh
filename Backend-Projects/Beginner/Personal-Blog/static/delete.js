for (const button of document.querySelectorAll(
  'form[id="delete"] button[type="submit"]'
)) {
  button.addEventListener("click", async (e) => {
    e.preventDefault();

    const confirmed = confirm("Are you sure you want to delete?");
    if (confirmed === false) return;

    await fetch(`/article/${button.dataset["id"]}`, { method: "DELETE" });
    location.reload();
  });
}
