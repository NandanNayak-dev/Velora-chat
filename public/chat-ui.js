document.addEventListener("click", (event) => {
  const closeAllEditors = () => {
    document.querySelectorAll("[data-edit-form]").forEach((form) => {
      form.hidden = true;
    });
  };

  const membersPanel = document.querySelector("[data-members-panel]");
  const membersOverlay = document.querySelector(".members-overlay");
  const openMembersPanel = () => {
    if (!membersPanel || !membersOverlay) return;
    membersPanel.classList.add("is-open");
    membersOverlay.hidden = false;
    membersOverlay.classList.add("is-open");
  };
  const closeMembersPanel = () => {
    if (!membersPanel || !membersOverlay) return;
    membersPanel.classList.remove("is-open");
    membersOverlay.classList.remove("is-open");
    membersOverlay.hidden = true;
  };

  if (event.target.closest("[data-members-open]")) {
    openMembersPanel();
    return;
  }

  if (event.target.closest("[data-members-close]")) {
    closeMembersPanel();
    return;
  }

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

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const membersPanel = document.querySelector("[data-members-panel]");
  const membersOverlay = document.querySelector(".members-overlay");
  if (membersPanel && membersOverlay && membersPanel.classList.contains("is-open")) {
    membersPanel.classList.remove("is-open");
    membersOverlay.classList.remove("is-open");
    membersOverlay.hidden = true;
  }
});
