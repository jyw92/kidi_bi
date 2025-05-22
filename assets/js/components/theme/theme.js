  // 테마 토글 설정
  function setupThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      const prefersDarkScheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      const initTheme = () => {
        const savedTheme = localStorage.getItem("theme");
        const theme = savedTheme || (prefersDarkScheme.matches ? "dark" : "");
        document.documentElement.setAttribute("data-theme", theme);
        updateThemeIcon(theme);
      };

      const updateThemeIcon = (theme) => {
        themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
      };

      themeToggle.addEventListener("click", () => {
        const currentTheme =
          document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
      });

      initTheme();
    }
  }

  export default setupThemeToggle;