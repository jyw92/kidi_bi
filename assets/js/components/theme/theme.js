function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) {
    console.warn("Theme toggle button with ID 'themeToggle' not found.");
    return;
  }

  // Highcharts 테마를 동적으로 적용하는 함수
  const applyHighchartsTheme = (theme) => {
    if (theme === "dark") {
      Highcharts.setOptions({
        chart: {
          backgroundColor: "#2a2a2b",
          style: {
            fontFamily: "'Unica One', sans-serif",
          },
        },
        title: {
          style: {
            color: "#E0E0E3",
          },
        },
        xAxis: {
          gridLineColor: "#707073",
          labels: {
            style: {
              color: "#E0E0E3",
            },
          },
        },
        yAxis: {
          gridLineColor: "#707073",
          labels: {
            style: {
              color: "#E0E0E3",
            },
          },
        },
        // Add other dark theme options here
      });
    } else {
      Highcharts.setOptions({
        chart: {
          backgroundColor: "#FFFFFF",
          style: {
            fontFamily: "'IBM Plex Sans', sans-serif",
          },
        },
        title: {
          style: {
            color: "#333333",
          },
        },
        xAxis: {
          gridLineColor: "#e6e6e6",
          labels: {
            style: {
              color: "#333333",
            },
          },
        },
        yAxis: {
          gridLineColor: "#e6e6e6",
          labels: {
            style: {
              color: "#333333",
            },
          },
        },
        // Add other light theme options here
      });
    }

    // 이미 로드된 차트 업데이트
    Highcharts.charts.forEach((chart) => chart && chart.redraw());
  };

  // UI 아이콘 업데이트 및 Highcharts 테마 적용을 통합 처리하는 함수
  const updateThemeIcon = (theme) => {
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    // applyHighchartsTheme(theme);
  };

  // 페이지 로드 시 초기 테마 설정
  const initTheme = () => {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = localStorage.getItem("theme");
    let initialTheme;

    if (!savedTheme) {
      initialTheme = "dark";
      localStorage.setItem("theme", initialTheme);
    } else {
      initialTheme = savedTheme;
    }

    document.documentElement.setAttribute("data-theme", initialTheme);
    updateThemeIcon(initialTheme);
  };

  // 토글 버튼 클릭 이벤트 리스너
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
  });

  // 초기화 함수 실행
  initTheme();
}

export default setupThemeToggle;