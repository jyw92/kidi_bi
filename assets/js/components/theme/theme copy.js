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

        // Remove any existing theme script
        const existingScript = document.getElementById("themeScript");
        if (existingScript) {
          existingScript.remove();
        }

        // Add the appropriate theme script
        const head = document.head;
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src =
          theme === "dark"
            ? "/assets/plugin/highchart/code/theme/dark-unica.js"
            : "/assets/plugin/highchart/code/theme/brand-light.js";
        script.id = "themeScript";
        head.appendChild(script);
      }; 

      themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);

        //head태그에
        //light 면 이렇게<script type="text/javascript" src="/assets/plugin/highchart/code/modules/white.js"></script>
        //dark 면 이렇게<script type="text/javascript" src="/assets/plugin/highchart/code/modules/dark.js"></script>
        const head = document.head;
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src =
              newTheme === "dark"
              ? "/assets/plugin/highchart/code/theme/dark-unica.js"
              : "/assets/plugin/highchart/code/theme/brand-light.js";
        script.id = "themeScript";
        // Remove the existing script if it exists
        if (existingScript) {
          head.removeChild(existingScript);
            // Remove the font links if they exist
            const fontLinks = [
            "https://fonts.googleapis.com/css?family=Unica+One",
            "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@200;300;400;600;700",
            ];
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach((link) => {
            if (fontLinks.includes(link.href)) {
              head.removeChild(link);
            }
            });
        }
        // Append the new script
        head.appendChild(script);

        // Update the theme icon
        // Remove any existing theme script
        const existingScript = document.getElementById("themeScript");
        if (existingScript) {
          head.removeChild(existingScript);
        }

        // Append the new script
        head.appendChild(script);

        // Update the theme icon
        updateThemeIcon(newTheme); 
      });

      initTheme();
    }
  }

  export default setupThemeToggle;