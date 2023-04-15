const grower = document.getElementById("grow-wrap-id");
if (grower) {
  const textarea = grower.querySelector("textarea");

  if (textarea) {
    grower.dataset.replicatedValue = textarea.value;

    textarea?.addEventListener("input", () => {
      grower.dataset.replicatedValue = textarea.value;
    });
  }
}
