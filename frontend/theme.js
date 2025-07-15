
const theme = {
  init() {
    this.setTheme(localStorage.getItem("ri-eat-dark") === "1");
    document.addEventListener("DOMContentLoaded", () => this.updateToggleButton());
  },

  toggle() {
    const isDarkMode = !document.documentElement.classList.contains("dark");
    this.setTheme(isDarkMode);
  },

  setTheme(isDarkMode) {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ri-eat-dark", "1");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ri-eat-dark", "0");
    }
    this.updateToggleButton();
  },

  updateToggleButton() {
    const toggleButton = document.getElementById("darkModeToggle");
    if (!toggleButton) return;

    const isDarkMode = document.documentElement.classList.contains("dark");
    toggleButton.innerHTML = isDarkMode
      ? '☀️ <span class="sr-only">Switch to light mode</span>'
      : '🌙 <span class="sr-only">Switch to dark mode</span>';
  }
};

theme.init();
