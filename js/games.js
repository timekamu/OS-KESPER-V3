
/* OS KESPER V3 - UNIVERSAL GAME LOADER */

const GameLoader = {
  currentURL: "",

  validate(value) {
    try {
      const url = new URL(value.trim());

      if (url.protocol !== "https:") {
        throw new Error("Only HTTPS links are allowed.");
      }

      return url.href;
    } catch (error) {
      throw new Error(error.message || "Invalid game URL.");
    }
  },

  run() {
    const input = document.getElementById("gameUrlInput");
    const frame = document.getElementById("gameFrame");
    const placeholder = document.getElementById("framePlaceholder");
    const title = document.getElementById("gameTitle");
    const note = document.getElementById("frameNote");

    try {
      const url = this.validate(input.value);

      this.currentURL = url;
      title.textContent = new URL(url).hostname.toUpperCase();

      frame.src = url;
      placeholder.classList.add("hidden");

      note.textContent =
        "Game loading. Use the original game's login interface.";

    } catch (error) {
      note.textContent = error.message;
    }
  },

  openExternal() {
    if (!this.currentURL) {
      try {
        this.currentURL = this.validate(
          document.getElementById("gameUrlInput").value
        );
      } catch (error) {
        document.getElementById("frameNote").textContent = error.message;
        return;
      }
    }

    window.open(this.currentURL, "_blank", "noopener,noreferrer");
  }
};

document.getElementById("runGame")
  .addEventListener("click", () => GameLoader.run());

document.getElementById("externalGame")
  .addEventListener("click", () => GameLoader.openExternal());

document.getElementById("gameUrlInput")
  .addEventListener("keydown", event => {
    if (event.key === "Enter") GameLoader.run();
  });
