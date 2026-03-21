document.addEventListener("click", (event) => {
  const closeAllEditors = () => {
    document.querySelectorAll("[data-edit-form]").forEach((form) => {
      form.hidden = true;
    });
  };

  const editToggle = event.target.closest("[data-edit-toggle]");
  if (editToggle) {
    const id = editToggle.getAttribute("data-edit-toggle");
    const form = document.querySelector(`[data-edit-form="${id}"]`);
    if (form) {
      const wasHidden = form.hidden;
      closeAllEditors();
      form.hidden = !wasHidden;
      if (form.hidden) {
        return;
      }
      const input = form.querySelector("input[name='content']");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
    return;
  }

  const cancelButton = event.target.closest("[data-edit-cancel]");
  if (cancelButton) {
    const id = cancelButton.getAttribute("data-edit-cancel");
    const form = document.querySelector(`[data-edit-form="${id}"]`);
    if (form) {
      form.hidden = true;
    }
  }
});
