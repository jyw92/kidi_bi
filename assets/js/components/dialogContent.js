import ChartOptionPopup from "./chartOptionPopup.js";

export default function DialogContent() {
  // 전역 변수 선언
  let currentTaskToDelete = null;
  let chartOptionPopupInstance = null;
  let tasks = [];

  // 페이지 로드 시 초기화 함수
  document.addEventListener("DOMContentLoaded", init);

  // 모달 닫기 함수들을 전역 스코프에 정의
  window.closeModal = function () {
    const modal = document.getElementById("taskModal");
    if (modal) modal.classList.remove("show");
    return !!modal;
  };

  window.closeHelpModal = function () {
    const modal = document.getElementById("helpModal");
    if (modal) modal.classList.remove("show");
    return !!modal;
  };

  // 초기화 함수 수정
  function init() {
    console.log("DOM 로드 완료, 초기화 실행");

    // 로컬 스토리지에서 작업 불러오기
    tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    // 기본 작업이 없으면 샘플 작업 추가
    if (!tasks || tasks.length === 0) {
      tasks = [
        {
          id: "default1",
          column: "type01",
          title: "테스트 차트1",
          color: "#3a86ff",
          chartType: "", // 기본 차트 타입 추가
        },
      ];
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // 중복 제거 및 필터링
    const uniqueTasks = [];
    const seenColumns = new Set();
    tasks.forEach((task) => {
      if (!seenColumns.has(task.column)) {
        seenColumns.add(task.column);
        uniqueTasks.push(task);
      }
    });
    tasks = uniqueTasks.filter((task) => task.column && task.title);

    // 이벤트 리스너 설정
    setupEventListeners();

    // 작업 로드 및 그리드 렌더링
    loadTasks();
    renderGrid();

    // 모달 닫기 버튼 설정
    setupModalCloseButtons();

    // 테마 토글 설정
    setupThemeToggle();

    // ChartOptionPopup 초기화
    chartOptionPopupInstance = ChartOptionPopup();
   
  }

  // 이벤트 리스너 설정 함수
  function setupEventListeners() {
    // 모달 닫기 이벤트
    document.addEventListener("click", (e) => {
      if (e.target?.classList?.contains("modal__close")) {
        window.closeModal();
        e.preventDefault();
        e.stopPropagation();
      }
      if (
        e.target?.classList?.contains("help-modal__close") ||
        e.target?.closest(".help-modal__close")
      ) {
        window.closeHelpModal();
        e.preventDefault();
        e.stopPropagation();
      }

      // 모달 외부 클릭 시 닫기
      if (
        e.target === document.getElementById("taskModal") &&
        document.getElementById("taskModal")?.classList.contains("show")
      ) {
        window.closeModal();
      }
      if (
        e.target === document.getElementById("helpModal") &&
        document.getElementById("helpModal")?.classList.contains("show")
      ) {
        window.closeHelpModal();
      }
    });

    // ESC 키 누를 때 모달 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.closeModal();
        window.closeHelpModal();
      }
    });

    // 삭제 확인 버튼
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    if (confirmDeleteBtn)
      confirmDeleteBtn.addEventListener("click", confirmDelete);

    // 삭제 취소 버튼
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    if (cancelDeleteBtn)
      cancelDeleteBtn.addEventListener("click", cancelDelete);

    // 작업 폼 제출 이벤트
    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
      taskForm.addEventListener("submit", handleTaskFormSubmit);
    }

    // 컬럼 드래그 앤 드롭 이벤트
    setupColumnDragEvents();

    // 작업 추가 버튼 이벤트
    document.querySelectorAll(".add-task").forEach((button) => {
      button.addEventListener("click", function () {
        openModal(this.closest(".column").id);
      });
    });

    // 도움말 토글 버튼
    const helpToggle = document.getElementById("helpToggle");
    if (helpToggle) {
      helpToggle.addEventListener("click", function () {
        const helpModal = document.getElementById("helpModal");
        if (helpModal) helpModal.classList.add("show");
      });
    }

    // 설정 저장 버튼
    const settingBtn = document.getElementById("settingBtn");
    if (settingBtn) {
      settingBtn.addEventListener("click", function () {
        saveTasksToLocalStorage();
        showConfirmation("Settings saved! ⚙️");
        console.log("Settings saved to localStorage");
        console.log("tasks", tasks);
        renderGrid();
      });
    }

    // 취소 버튼
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        loadTasks();
        showConfirmation("Changes discarded! 🔄");
        renderGrid();
      });
    }
  }

  // 컬럼 드래그 앤 드롭 이벤트 설정
  function setupColumnDragEvents() {
    const columns = document.querySelectorAll(".column");
    columns.forEach((column) => {
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (document.querySelector(".dragging"))
          column.classList.add("drag-over");
      });

      column.addEventListener("dragleave", () =>
        column.classList.remove("drag-over")
      );

      column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.classList.remove("drag-over");
        const taskId = e.dataTransfer.getData("text/plain");
        if (!taskId) return;

        const draggedTask = tasks.find((t) => t.id === taskId);
        if (!draggedTask) return;

        const sourceColumnId = draggedTask.column;
        const targetColumnId = column.id;
        if (sourceColumnId === targetColumnId) return;

        const targetTask = tasks.find((t) => t.column === targetColumnId);
        draggedTask.column = targetColumnId;
        if (targetTask) targetTask.column = sourceColumnId;

        document.querySelectorAll(".task").forEach((taskEl) => taskEl.remove());
        tasks.forEach(renderTask);
        addController();
      });
    });
  }

  // 모달 닫기 버튼 설정
  function setupModalCloseButtons() {
    setTimeout(() => {
      document
        .querySelectorAll(".modal__close")
        .forEach((btn) =>
          btn.setAttribute("onclick", "window.closeModal(); return false;")
        );

      document
        .querySelectorAll(".help-modal__close")
        .forEach((btn) =>
          btn.setAttribute("onclick", "window.closeHelpModal(); return false;")
        );

      // 모달에 닫기 버튼이 없으면 추가
      const taskModal = document.getElementById("taskModal");
      if (taskModal && !taskModal.querySelector(".modal__close")) {
        const closeBtn = document.createElement("button");
        closeBtn.className = "modal__close";
        closeBtn.innerHTML = "×";
        Object.assign(closeBtn.style, {
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "24px",
          background: "none",
          border: "none",
          cursor: "pointer",
        });
        const modalHeader = taskModal.querySelector("h2")?.parentNode;
        (modalHeader || taskModal).insertBefore(
          closeBtn,
          modalHeader ? modalHeader.firstChild : taskModal.firstChild
        );
        closeBtn.onclick = () => {
          window.closeModal();
          return false;
        };
      }

      const helpModal = document.getElementById("helpModal");
      if (helpModal && !helpModal.querySelector(".help-modal__close")) {
        const closeBtn = document.createElement("button");
        closeBtn.className = "help-modal__close";
        closeBtn.innerHTML = "×";
        Object.assign(closeBtn.style, {
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "24px",
          background: "none",
          border: "none",
          cursor: "pointer",
        });
        const modalHeader = helpModal.querySelector("h2")?.parentNode;
        (modalHeader || helpModal).insertBefore(
          closeBtn,
          modalHeader ? modalHeader.firstChild : helpModal.firstChild
        );
        closeBtn.onclick = () => {
          window.closeHelpModal();
          return false;
        };
      }
    }, 1000);

    // DOM 변경 감지하여 새로 추가된 요소에 이벤트 리스너 추가
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              node.querySelectorAll(".modal__close").forEach((btn) => {
                btn.onclick = () => {
                  window.closeModal();
                  return false;
                };
              });
              node.querySelectorAll(".help-modal__close").forEach((btn) => {
                btn.onclick = () => {
                  window.closeHelpModal();
                  return false;
                };
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

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

  // 작업 폼 제출 처리 함수 수정
  function handleTaskFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const taskId = form.dataset.editId;
    const title = document.getElementById("taskTitle").value;
    // const description = document.getElementById("taskDescription").value;
    const color = document.getElementById("taskColor").value;
    const column = document.getElementById("columnType").value;

    // 차트 타입 가져오기 (입력 필드 또는 ChartOptionPopup에서)
    let chartType = document.getElementById("chartType").value;

    // 입력 필드에 값이 없으면 ChartOptionPopup에서 가져오기
    if (!chartType && chartOptionPopupInstance) {
      chartType = chartOptionPopupInstance.getSelectedChartType();
    }

    if (taskId) {
      // 기존 작업 수정
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        const parentColumn = document
          .querySelector(`[data-task-id="${taskId}"]`)
          ?.closest(".column")?.id;
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          title,
          // description,
          color,
          column,
          chartType,
        };
        if (
          parentColumn !== column &&
          document.querySelector(`[data-task-id="${taskId}"]`)
        ) {
          document.querySelector(`[data-task-id="${taskId}"]`).remove();
        }
        renderTask(tasks[taskIndex], parentColumn === column);
      }
      delete form.dataset.editId;
    } else {
      // 새 작업 생성
      const newTask = {
        id: Date.now().toString(),
        title,
        // description,
        color,
        column,
        chartType,
      };
      tasks.push(newTask);
      renderTask(newTask);
    }

    closeModal();
    showConfirmation(
      taskId ? "Task successfully updated! 🎉" : "Task successfully created! 🎉"
    );
  }

  // 작업 로드
  function loadTasks() {
    document.querySelectorAll(".task").forEach((taskEl) => taskEl.remove());
    document.querySelectorAll(".task-list").forEach((taskList) => {
      const addTaskButton = taskList.querySelector(".add-task");
      while (taskList.firstChild) taskList.removeChild(taskList.firstChild);
      if (addTaskButton) taskList.appendChild(addTaskButton);
    });
    tasks.forEach(renderTask);
    addController();
  }

  // 작업 렌더링
  function renderTask(task, isUpdate = false) {
    const column = document.getElementById(task.column);
    const taskList = column?.querySelector(".task-list");
    if (!taskList) return;

    const existingTask = taskList.querySelector(
      `.task[data-task-id="${task.id}"]`
    );
    if (existingTask && isUpdate) {
      existingTask.innerHTML = createTaskHTML(task);
      existingTask.style.border = `2px solid ${task.color}`;
      existingTask
        .querySelector(".edit-btn")
        .addEventListener("click", () => openEditModal(task.id));
      existingTask
        .querySelector(".delete-btn")
        .addEventListener("click", () => deleteTask(task.id));
      return;
    } else if (existingTask) {
      existingTask.remove();
    }

    const taskElement = document.createElement("div");
    taskElement.className = "task";
    taskElement.draggable = true;
    taskElement.dataset.taskId = task.id;
    taskElement.style.border = `2px solid ${task.color}`;
    taskElement.innerHTML = createTaskHTML(task);

    taskElement.addEventListener("dragstart", function (e) {
      this.classList.add("dragging");
      this.style.opacity = "0.5";
      e.dataTransfer.setData("text/plain", this.dataset.taskId);
    });

    taskElement.addEventListener("dragend", function () {
      this.classList.remove("dragging");
      this.style.opacity = "1";
      document
        .querySelectorAll(".column")
        .forEach((col) => col.classList.remove("drag-over"));
    });

    const addTaskButton = taskList.querySelector(".add-task");
    if (addTaskButton) {
      addTaskButton.style.display = "none";
      taskList.insertBefore(taskElement, addTaskButton.nextSibling);
    } else {
      taskList.appendChild(taskElement);
    }

    taskElement
      .querySelector(".edit-btn")
      .addEventListener("click", () => openEditModal(task.id));
    taskElement
      .querySelector(".delete-btn")
      .addEventListener("click", () => deleteTask(task.id));
  }

  // 작업 HTML 생성
  function createTaskHTML(task) {
    return `
    <div class="task__header">
      <h3 class="task__title">${task.title}</h3>
      <div class="task__actions">
        <button class="action-btn edit-btn">✏️</button>
        <button class="action-btn delete-btn">🗑️</button>
      </div>
    </div>
  `;
  }

  // 작업 수정 모달 열기 함수 수정
  function openEditModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const form = document.getElementById("taskForm");
    if (!form) return;

    form.reset();
    form.dataset.editId = taskId;

    document.getElementById("taskTitle").value = task.title;
    // document.getElementById("taskDescription").value = task.description;
    document.getElementById("taskColor").value = task.color;
    document.getElementById("columnType").value = task.column;

    // 차트 타입 설정
    const chartTypeInput = document.getElementById("chartType");
    if (chartTypeInput) {
      chartTypeInput.value = task.chartType || "";
    }

    // ChartOptionPopup에 차트 타입 설정
    if (chartOptionPopupInstance) {
      chartOptionPopupInstance.setChartType(task.chartType);
    }

    document.querySelector('#taskForm button[type="submit"]').textContent =
      "Update Chart";
    document.querySelector("#taskModal h2").textContent = "Edit Chart";

    const taskModal = document.getElementById("taskModal");
    if (taskModal) taskModal.classList.add("show");
  }

  // 새 작업 모달 열기 함수 수정
  function openModal(columnType) {
    const form = document.getElementById("taskForm");
    if (form) {
      form.reset();
      delete form.dataset.editId;
    }

    const columnTypeInput = document.getElementById("columnType");
    if (columnTypeInput) columnTypeInput.value = columnType;

    // 차트 타입 초기화
    const chartTypeInput = document.getElementById("chartType");
    if (chartTypeInput) {
      chartTypeInput.value = "";
    }

    // ChartOptionPopup 초기화 (첫 번째 버튼 선택)
    if (chartOptionPopupInstance) {
      const buttons = document.querySelectorAll(
        "#chartRequestOptions .dialog--btn"
      );
      if (buttons.length > 0) {
        buttons.forEach((btn) => btn.classList.remove("--active"));
        buttons[0].classList.add("--active");

        const defaultChartType = buttons[0].getAttribute("data-chart-type");
        if (chartTypeInput && defaultChartType) {
          chartTypeInput.value = defaultChartType;
        }
      }
    }

    document.querySelector('#taskForm button[type="submit"]').textContent =
      "Add Chart";
    document.querySelector("#taskModal h2").textContent = "새 차트";

    const taskModal = document.getElementById("taskModal");
    if (taskModal) taskModal.classList.add("show");

    setTimeout(() => document.getElementById("taskTitle")?.focus(), 100);
  }

  // 작업 삭제 확인 모달 열기
  function deleteTask(taskId) {
    currentTaskToDelete = taskId;
    document.getElementById("deleteConfirmationModal").classList.add("show");
  }

  // 삭제 취소
  function cancelDelete() {
    currentTaskToDelete = null;
    document.getElementById("deleteConfirmationModal").classList.remove("show");
  }

  // 삭제 확인
  function confirmDelete() {
    if (!currentTaskToDelete) {
      console.error("삭제할 작업 ID가 없습니다");
      document
        .getElementById("deleteConfirmationModal")
        .classList.remove("show");
      return;
    }

    const taskToDeleteIndex = tasks.findIndex(
      (t) => t.id === currentTaskToDelete
    );
    if (taskToDeleteIndex === -1) {
      console.error("삭제할 작업을 찾을 수 없습니다");
      document
        .getElementById("deleteConfirmationModal")
        .classList.remove("show");
      return;
    }

    const columnId = tasks[taskToDeleteIndex].column;
    tasks.splice(taskToDeleteIndex, 1);

    const taskElement = document.querySelector(
      `[data-task-id="${currentTaskToDelete}"]`
    );
    if (taskElement) taskElement.remove();

    const column = document.getElementById(columnId);
    if (column && !column.querySelector(".task")) {
      const addTaskButton = column.querySelector(".add-task");
      if (addTaskButton) addTaskButton.style.display = "flex";
    }

    document.getElementById("deleteConfirmationModal").classList.remove("show");
    showConfirmation("Task successfully deleted! 🗑️");
    currentTaskToDelete = null;
    alert("삭제완료");
  }

  // 확인 메시지 표시
  function showConfirmation(message) {
    const modal = document.getElementById("confirmationModal");
    const messageElement = document.getElementById("confirmationMessage");

    let displayMessage = message;
    if (message.includes("supprimée")) displayMessage = "차트 삭제 완료 🗑️";
    else if (message.includes("업데이트")) displayMessage = "차트 수정 완료 🎉";
    else if (message.includes("생성됨")) displayMessage = "차트 생성 완료 🎉";

    messageElement.textContent = displayMessage;
    modal.classList.add("show");
    addController();
    setTimeout(() => modal.classList.remove("show"), 500);
  }

  // 컨트롤러 추가
  function addController() {
    document.querySelectorAll(".task-list").forEach((taskList) => {
      const addTaskButton = taskList.querySelector(".add-task");
      const hasTask = taskList.querySelector(".task") !== null;
      if (addTaskButton)
        addTaskButton.style.display = hasTask ? "none" : "flex";
    });
  }

  // 로컬 스토리지에 작업 저장
  function saveTasksToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    console.log("로컬 스토리지에 작업 저장됨");
  }

  // 그리드 렌더링 함수 개선
  function renderGrid() {
    const uniqueColumns = [...new Set(tasks.map((task) => task.column))];
    const grid = document.querySelector(".grid");

    if (!grid) return;

    grid.style.gridTemplateRows = `auto`;
    grid.style.gridTemplateColumns = `auto`;
    grid.innerHTML = "";

    // 1개 컬럼일 때
    if (uniqueColumns.length === 1) {
      renderSingleColumnGrid(grid, uniqueColumns);
    }
    // 2개 컬럼일 때
    else if (uniqueColumns.length === 2) {
      renderTwoColumnGrid(grid, uniqueColumns);
    }
    // 3개 컬럼일 때
    else if (uniqueColumns.length === 3) {
      renderThreeColumnGrid(grid, uniqueColumns);
    }
    // 4개 이상 컬럼일 때
    else if (uniqueColumns.length >= 4) {
      renderFourColumnGrid(grid, uniqueColumns);
    }
  }

  // 1개 컬럼 그리드 렌더링 - 간소화
  function renderSingleColumnGrid(grid, uniqueColumns) {
    grid.style.gridTemplateColumns = `repeat(1, 1fr)`;
    grid.style.gridTemplateRows = `repeat(1, 1fr)`;

    grid.innerHTML = createGridItemHTML(uniqueColumns[0], tasks);
  }

  // 2개 컬럼 그리드 렌더링 - 간소화
  function renderTwoColumnGrid(grid, uniqueColumns) {
    const column1 = uniqueColumns[0];
    const column2 = uniqueColumns[1];

    // 수평 레이아웃 조합 확인
    const isHorizontal =
      (column1 === "type01" && column2 === "type02") ||
      (column1 === "type02" && column2 === "type01");

    if (isHorizontal) {
      // 수평 레이아웃 (2x1)
      grid.style.gridTemplateColumns = `repeat(2, 1fr)`;
      grid.style.gridTemplateRows = `repeat(1, 1fr)`;

      grid.innerHTML =
        createGridItemHTML("type01", tasks) +
        createGridItemHTML("type02", tasks);
    } else {
      // 수직 레이아웃 (1x2)
      grid.style.gridTemplateColumns = `repeat(1, 1fr)`;
      grid.style.gridTemplateRows = `repeat(2, 1fr)`;

      // 컬럼 타입 조합에 따른 타이틀 결정
      const columnPairs = [
        { pair: ["type01", "type03"], titles: ["type01", "type03"] },
        { pair: ["type02", "type03"], titles: ["type02", "type03"] },
        { pair: ["type01", "type04"], titles: ["type01", "type04"] },
        { pair: ["type02", "type04"], titles: ["type02", "type04"] },
      ];

      let typeA = column1;
      let typeB = column2;

      // 조합 찾기
      columnPairs.forEach((item) => {
        if (
          (column1 === item.pair[0] && column2 === item.pair[1]) ||
          (column1 === item.pair[1] && column2 === item.pair[0])
        ) {
          typeA = item.titles[0];
          typeB = item.titles[1];
        }
      });

      grid.innerHTML =
        createGridItemHTML(typeA, tasks) + createGridItemHTML(typeB, tasks);
    }
  }

  // 3개 컬럼 그리드 렌더링 - 간소화
  function renderThreeColumnGrid(grid, uniqueColumns) {
    grid.style.gridTemplateColumns = `repeat(2, 1fr)`;
    grid.style.gridTemplateRows = `repeat(2, 1fr)`;

    // 레이아웃 설정 배열
    const layoutConfigs = [
      {
        columns: ["type01", "type02", "type04"],
        layout: [
          { type: "type01", fullWidth: false },
          { type: "type02", fullWidth: false },
          { type: "type04", fullWidth: true },
        ],
      },
      {
        columns: ["type01", "type02", "type03"],
        layout: [
          { type: "type01", fullWidth: false },
          { type: "type02", fullWidth: false },
          { type: "type03", fullWidth: true },
        ],
      },
      {
        columns: ["type01", "type03", "type04"],
        layout: [
          { type: "type01", fullWidth: true },
          { type: "type03", fullWidth: false },
          { type: "type04", fullWidth: false },
        ],
      },
      {
        columns: ["type02", "type03", "type04"],
        layout: [
          { type: "type02", fullWidth: true },
          { type: "type03", fullWidth: false },
          { type: "type04", fullWidth: false },
        ],
      },
    ];

    // 현재 컬럼 조합에 맞는 레이아웃 찾기
    let matchedLayout = null;

    layoutConfigs.forEach((config) => {
      if (hasColumnCombination(uniqueColumns, config.columns)) {
        matchedLayout = config.layout;
      }
    });

    // 일치하는 레이아웃이 있으면 사용, 없으면 기본 레이아웃 사용
    if (matchedLayout) {
      let gridHTML = "";

      matchedLayout.forEach((item) => {
        gridHTML += createGridItemHTML(item.type, tasks, item.fullWidth);
      });

      grid.innerHTML = gridHTML;
    } else {
      // 기본 레이아웃 (첫 번째 항목이 전체 너비)
      grid.innerHTML =
        createGridItemHTML(uniqueColumns[0], tasks, true) +
        createGridItemHTML(uniqueColumns[1], tasks) +
        createGridItemHTML(uniqueColumns[2], tasks);
    }
  }

  // 4개 컬럼 그리드 렌더링 - 레이아웃 설정 추가
  function renderFourColumnGrid(grid, uniqueColumns) {
    grid.style.gridTemplateColumns = `repeat(2, 1fr)`;
    grid.style.gridTemplateRows = `repeat(2, 1fr)`;

    // 레이아웃 설정 배열
    const layoutConfigs = [
      // 4개 모두 있는 경우의 다양한 레이아웃
      {
        columns: ["type01", "type02", "type03", "type04"],
        layout: [
          { type: "type01", fullWidth: false },
          { type: "type02", fullWidth: false },
          { type: "type03", fullWidth: false },
          { type: "type04", fullWidth: false },
        ],
      },
      {
        columns: ["type01", "type02", "type03", "type04"],
        layout: [
          { type: "type01", fullWidth: true },
          { type: "type02", fullWidth: false },
          { type: "type03", fullWidth: false },
          { type: "type04", fullWidth: false },
        ],
      },
      {
        columns: ["type01", "type02", "type03", "type04"],
        layout: [
          { type: "type02", fullWidth: true },
          { type: "type01", fullWidth: false },
          { type: "type03", fullWidth: false },
          { type: "type04", fullWidth: false },
        ],
      },
      {
        columns: ["type01", "type02", "type03", "type04"],
        layout: [
          { type: "type03", fullWidth: true },
          { type: "type01", fullWidth: false },
          { type: "type02", fullWidth: false },
          { type: "type04", fullWidth: false },
        ],
      },
      {
        columns: ["type01", "type02", "type03", "type04"],
        layout: [
          { type: "type04", fullWidth: true },
          { type: "type01", fullWidth: false },
          { type: "type02", fullWidth: false },
          { type: "type03", fullWidth: false },
        ],
      },
    ];

    // 현재 컬럼 조합에 맞는 레이아웃 찾기
    let matchedLayout = null;

    // 우선 정확한 컬럼 조합 찾기
    layoutConfigs.forEach((config) => {
      // 정확한 컬럼 조합 및 우선순위 확인
      if (hasColumnCombination(uniqueColumns, config.columns)) {
        // 우선순위가 있는 경우 확인
        if (config.priority) {
          const priorityMatch = config.priority.every((type) =>
            uniqueColumns.includes(type)
          );

          if (priorityMatch) {
            matchedLayout = config.layout;
          }
        }
        // 우선순위가 없거나 첫 번째 일치하는 레이아웃 사용
        else if (!matchedLayout) {
          matchedLayout = config.layout;
        }
      }
    });

    // 일치하는 레이아웃이 있으면 사용, 없으면 기본 레이아웃 사용
    if (matchedLayout) {
      let gridHTML = "";

      matchedLayout.forEach((item) => {
        gridHTML += createGridItemHTML(item.type, tasks, item.fullWidth);
      });

      grid.innerHTML = gridHTML;
    } else {
      // 기본 레이아웃 - 모든 항목을 2x2 그리드로 배치
      let gridHTML = "";

      // 최대 4개까지만 표시
      uniqueColumns.slice(0, 4).forEach((columnType) => {
        gridHTML += createGridItemHTML(columnType, tasks);
      });

      grid.innerHTML = gridHTML;
    }
  }

  // 컬럼 조합 확인 헬퍼 함수
  function hasColumnCombination(uniqueColumns, targetColumns) {
    return targetColumns.every((col) => uniqueColumns.includes(col));
  }

  // 작업 제목 가져오기
  function getTaskTitle(columnType, tasks) {
    const task = tasks.find((task) => task.column === columnType);
    return task ? task.title : "Unknown Title";
  }
  // 작업 색상 가져오기 함수
  function getTaskColor(columnType, tasks) {
    const task = tasks.find((task) => task.column === columnType);
    return task ? task.color : "#ffffff"; // 기본 색상은 흰색
  }

  // 그리드 아이템 HTML 생성 함수
  function createGridItemHTML(columnType, tasks, isFullWidth = false) {
    const title = getTaskTitle(columnType, tasks);
    const color = getTaskColor(columnType, tasks);
    const spanStyle = isFullWidth ? "grid-column: 1 / -1;" : "";

    return `
    <div class="grid--item" data-grid-type="chart" style="${spanStyle} background-color: ${color}8a;">
      <div class="chart--item inner--item">
        <h3 class="grid--title">${title}</h3>
        <div class="grid--info--area">
          하이차트 들어오는부분
        </div>
      </div>
    </div>
  `;
  }
}
