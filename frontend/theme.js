const theme = {
  init() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("ri-eat-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Use saved theme, or system preference, or default to light
    const isDarkMode = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    this.setTheme(isDarkMode);
    this.setupSystemThemeListener();
    
    // Update toggle button when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener("DOMContentLoaded", () => this.updateToggleButton());
    } else {
      this.updateToggleButton();
    }
  },

  toggle() {
    const isDarkMode = !document.documentElement.classList.contains("dark");
    this.setTheme(isDarkMode);
  },

  setTheme(isDarkMode) {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("ri-eat-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("ri-eat-theme", "light");
    }
    
    this.updateToggleButton();
    this.updateThemeColors();
  },

  updateThemeColors() {
    const isDarkMode = document.documentElement.classList.contains("dark");
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDarkMode ? "#1f2937" : "#f97316");
    }
  },

  updateToggleButton() {
    const toggleButton = document.getElementById("darkModeToggle");
    if (!toggleButton) return;

    const isDarkMode = document.documentElement.classList.contains("dark");
    
    toggleButton.innerHTML = isDarkMode
      ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
         </svg>
         <span class="sr-only">Switch to light mode</span>`
      : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
         </svg>
         <span class="sr-only">Switch to dark mode</span>`;
    
    toggleButton.setAttribute("aria-label", isDarkMode ? "Switch to light mode" : "Switch to dark mode");
  },

  setupSystemThemeListener() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addListener((e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem("ri-eat-theme")) {
        this.setTheme(e.matches);
      }
    });
  }
};

// Initialize theme immediately to prevent flash
theme.init();