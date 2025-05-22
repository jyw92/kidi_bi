import ChartConfigManager from "./ChartConfigManager.js";
import { fetchData } from "./fetchData.js";
import Dialog from "./dialog.js";
import renderGrid from "./renderGrid/renderGrid.js";
import setupThemeToggle from "./theme/theme.js";
import showConfirmation from "./confirmation/confirmation.js";
import addController from "./addController/addController.js";

/* -------------------------------------------------------------------------- */
/* 파일명 : ChartTaskManage.js
/* -------------------------------------------------------------------------- */
/* 작업(차트) 생성, 수정, 삭제 관리
/* 모달 다이얼로그 열기/닫기 처리
/* 로컬 스토리지에 작업 데이터 저장
/* 그리드 렌더링 및 차트 렌더링 처리
/* 드래그 앤 드롭 기능 관리
/* 이벤트 리스너 설정                                                         
/* -------------------------------------------------------------------------- */

const dialog = new Dialog();

export default function ChartTaskManager() {
  // 전역 변수 선언
  let currentTaskToDelete = null;
  let chartConfigManagerInstance = null;
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

  // 초기화 함수 - async 키워드 추가
  async function init() {
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
          chartType: "chart-1", // 기본 차트 타입 추가
          buttonTitle: "첫페이지",
          buttonId: "0000",
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
    renderGrid(tasks);

    // 모달 닫기 버튼 설정
    setupModalCloseButtons();

    // 테마 토글 설정
    setupThemeToggle();

    // ChartConfigManager 초기화
    chartConfigManagerInstance = ChartConfigManager();

    // 차트 렌더링 - 페이지 로드 시 실행
    try {
      console.log("페이지 로드 시 차트 렌더링 시작");

      // Highcharts 라이브러리 로드 확인
      if (typeof Highcharts === "undefined") {
        console.error("Highcharts 라이브러리가 로드되지 않았습니다.");
        return;
      }

      // 로딩 표시
      showConfirmation("차트 데이터 로딩 중... ⌛");

      // 차트 인스턴스 객체 초기화 확인
      if (!window.chartInstances) {
        window.chartInstances = {};
      }

      // 기존 차트 인스턴스 정리
      Object.keys(window.chartInstances).forEach((id) => {
        try {
          if (
            window.chartInstances[id] &&
            typeof window.chartInstances[id].destroy === "function"
          ) {
            window.chartInstances[id].destroy();
          }
        } catch (e) {
          console.error("차트 인스턴스 제거 오류:", e);
        }
      });
      window.chartInstances = {}; // 객체 재초기화

      // 모든 차트 컨테이너 요소 가져오기
      const chartContainers = document.querySelectorAll(".grid--info--area");

      // 각 task에 대해 개별적으로 서버 요청
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        // task의 ID나 다른 식별자를 사용하여 서버에 요청
        // 예: buttonId가 있으면 해당 ID를 사용, 없으면 task ID 사용
        const requestId = task.buttonId || task.id;

        console.log(`Task ${i + 1}/${tasks.length} 데이터 요청: ${requestId}`);

        try {
          // 각 task에 대한 개별 요청
          const chartData = await fetchData(
            `http://localhost:3000/hichartData?id=${requestId}`
          );

          console.log(`Task ${i + 1} 차트 데이터 수신:`, chartData);

          // 해당 task에 맞는 컨테이너 찾기
          if (chartContainers[i]) {
            const container = chartContainers[i];
            const containerId = container.getAttribute("id");

            if (!containerId) {
              console.warn(`컨테이너 ${i}에 ID가 없습니다`);
              continue;
            }

            // 차트 렌더링
            createHighChart(chartData, containerId);
            console.log(`Task ${i + 1} 차트 렌더링 완료: ${containerId}`);
          }
        } catch (error) {
          console.error(`Task ${i + 1} 데이터 요청 오류:`, error);
        }
      }

      showConfirmation("차트가 성공적으로 렌더링되었습니다! 📊");
    } catch (error) {
      console.error("차트 데이터 가져오기 오류:", error);
      showConfirmation("차트 데이터 로딩 오류! ⚠️");
    }
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
      settingBtn.addEventListener("click", async function (e) {
        // 기본 동작 방지 (페이지 새로고침 방지)
        e.preventDefault();
        e.stopPropagation();

        // 로컬 스토리지에 저장 및 알림 표시
        saveTasksToLocalStorage();
        showConfirmation("설정이 저장되었습니다! ⚙️");
        console.log("Settings saved to localStorage");
        console.log("tasks", tasks);

        // 그리드 렌더링
        renderGrid(tasks);

        try {
          // 로딩 표시
          showConfirmation("차트 데이터 로딩 중... ⌛");

          // 차트 인스턴스 객체 초기화 확인
          if (!window.chartInstances) {
            window.chartInstances = {};
          }

          // 기존 차트 인스턴스 정리
          Object.keys(window.chartInstances).forEach((id) => {
            try {
              if (
                window.chartInstances[id] &&
                typeof window.chartInstances[id].destroy === "function"
              ) {
                window.chartInstances[id].destroy();
              }
            } catch (e) {
              console.error("차트 인스턴스 제거 오류:", e);
            }
          });
          window.chartInstances = {}; // 객체 재초기화

          // 모든 차트 컨테이너 요소 가져오기
          const chartContainers =
            document.querySelectorAll(".grid--info--area");

          // 각 task에 대해 개별적으로 서버 요청
          for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];

            // task의 ID나 다른 식별자를 사용하여 서버에 요청
            // 예: buttonId가 있으면 해당 ID를 사용, 없으면 task ID 사용
            const requestId = task.buttonId || task.id;

            console.log(
              `Task ${i + 1}/${tasks.length} 데이터 요청: ${requestId}`
            );

            try {
              // 각 task에 대한 개별 요청
              const chartData = await fetchData(
                `http://localhost:3000/hichartData?id=${requestId}`
              );

              console.log(`Task ${i + 1} 차트 데이터 수신:`, chartData);

              // 해당 task에 맞는 컨테이너 찾기
              if (chartContainers[i]) {
                const container = chartContainers[i];
                const containerId = container.getAttribute("id");

                if (!containerId) {
                  console.warn(`컨테이너 ${i}에 ID가 없습니다`);
                  continue;
                }

                // 차트 렌더링
                createHighChart(chartData, containerId);
                console.log(`Task ${i + 1} 차트 렌더링 완료: ${containerId}`);
              }
            } catch (error) {
              console.error(`Task ${i + 1} 데이터 요청 오류:`, error);
            }
          }

          showConfirmation("차트가 성공적으로 렌더링되었습니다! 📊");
          setTimeout(() => {
            dialog.close();
          }, 500);
        } catch (error) {
          console.error("차트 데이터 가져오기 오류:", error);
          showConfirmation("차트 데이터 로딩 오류! ⚠️");
        }
      });

      // 폼 제출 방지를 위한 추가 조치
      const parentForm = settingBtn.closest("form");
      if (parentForm) {
        parentForm.addEventListener("submit", function (e) {
          e.preventDefault();
          return false;
        });
      }
    }

    // 취소 버튼
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        dialog.close();
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

  // 작업 폼 제출 처리 함수
  function handleTaskFormSubmit(e) {
    e.preventDefault();

    // #selectList 버튼 유효성 검사
    const selectList = document.getElementById("selectList");
    if (selectList) {
      const hasSelectedButton =
        selectList.querySelector("button.selected") !== null;
      if (!hasSelectedButton) {
        console.warn("선택된 버튼이 없습니다. 버튼을 선택해주세요.");
        showConfirmation("버튼을 선택해주세요! ⚠️");
        return; // 선택된 버튼이 없으면 함수 종료
      }
    }

    const form = e.target;
    const taskId = form.dataset.editId;
    const title = document.getElementById("taskTitle").value;
    // const description = document.getElementById("taskDescription").value;
    const color = document.getElementById("taskColor").value;
    const column = document.getElementById("columnType").value;

    // 차트 타입 가져오기 (입력 필드 또는 ChartConfigManager에서)
    let chartType = document.getElementById("chartType").value;

    // 입력 필드에 값이 없으면 ChartConfigManager에서 가져오기
    if (!chartType && chartConfigManagerInstance) {
      chartType = chartConfigManagerInstance.getSelectedChartType();
    }

    // 선택된 버튼 정보 가져오기
    let buttonId = null;
    let buttonTitle = null;

    if (chartConfigManagerInstance) {
      const selectedButton = chartConfigManagerInstance.getSelectedButton();
      if (selectedButton) {
        buttonId = selectedButton.id;
        buttonTitle = selectedButton.title;
        console.log("선택된 버튼 정보:", { buttonId, buttonTitle });
      }
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
          buttonId,
          buttonTitle,
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
        buttonId,
        buttonTitle,
      };
      tasks.push(newTask);
      renderTask(newTask);
    }

    // 로컬 스토리지에 작업 저장
    saveTasksToLocalStorage();

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
      <div class="task__actions">
        <button class="action-btn edit-btn">✏️</button>
        <button class="action-btn delete-btn">🗑️</button>
      </div>
    </div>
    <div class="task__body">
      <h3 class="task__title">${task.title}</h3>
      <span>${task.buttonTitle}</span>
    </div>
  `;
  }

  // 작업 수정 모달 열기 함수
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

    // ChartConfigManager에 차트 타입 설정
    if (chartConfigManagerInstance) {
      chartConfigManagerInstance.setChartType(task.chartType);

      // 버튼 선택 상태 복원 (필요한 경우)
      if (task.buttonId && task.buttonTitle) {
        // 첫 번째 시도: 즉시 버튼 선택 시도
        trySelectButton();

        // 두 번째 시도: 짧은 지연 후 다시 시도
        setTimeout(trySelectButton, 300);

        // 세 번째 시도: 더 긴 지연 후 다시 시도
        setTimeout(trySelectButton, 800);
      }

      // 버튼 선택 함수
      function trySelectButton() {
        console.log("버튼 선택 시도:", task.buttonId);
        const selectListBox = document.getElementById("selectList");
        if (!selectListBox) {
          console.warn("selectList 요소를 찾을 수 없습니다");
          return;
        }

        // 모든 버튼에서 selected 클래스 제거
        selectListBox.querySelectorAll("button").forEach((btn) => {
          btn.classList.remove("selected");
        });

        // 해당 ID를 가진 버튼 찾기
        const targetButton = selectListBox.querySelector(
          `button[data-id="${task.buttonId}"]`
        );
        if (targetButton) {
          console.log("버튼 찾음, selected 클래스 추가:", task.buttonId);
          targetButton.classList.add("selected");

          // // 버튼 클릭 이벤트도 발생시켜 내부 상태 업데이트
          // try {
          //   targetButton.click();
          // } catch (e) {
          //   console.warn("버튼 클릭 이벤트 발생 중 오류:", e);
          // }

          // ChartConfigManager 내부 상태 업데이트 (필요한 경우)
          if (
            chartConfigManagerInstance &&
            typeof chartConfigManagerInstance.updateSelectedButton ===
              "function"
          ) {
            chartConfigManagerInstance.updateSelectedButton(task.buttonId);
          }
        } else {
          console.warn(`ID가 ${task.buttonId}인 버튼을 찾을 수 없습니다`);
        }
      }
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

    // ChartConfigManager 초기화 (첫 번째 버튼 선택)
    if (chartConfigManagerInstance) {
      const buttons = document.querySelectorAll(
        "#chartRequestOptions .dialog--btn"
      );
      if (buttons.length > 0) {
        buttons.forEach((btn) => btn.classList.remove("--active"));
        buttons[0].classList.add("--active");

        const defaultChartType = buttons[0].getAttribute("data-chart-type");
        if (chartTypeInput && defaultChartType) {
          chartTypeInput.value = defaultChartType;

          // 첫 번째 버튼에 해당하는 차트 타입으로 설정
          chartConfigManagerInstance.setChartType(defaultChartType);

          // 약간의 지연 후 selectList 버튼 초기화
          setTimeout(() => {
            // ChartConfigManager의 resetSelectList 메서드 호출
            if (
              typeof chartConfigManagerInstance.resetSelectList === "function"
            ) {
              chartConfigManagerInstance.resetSelectList();
            }
          }, 300); // 템플릿이 로드된 후 실행하기 위한 지연
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
  }

  // 로컬 스토리지에 작업 저장
  function saveTasksToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    console.log("로컬 스토리지에 작업 저장됨");
  }

  // createHighChart 함수 수정
  function createHighChart(data, containerId) {
    try {
      // 컨테이너 요소 가져오기
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`차트 컨테이너를 찾을 수 없습니다: ${containerId}`);
        return;
      }

      // Highcharts가 정의되어 있는지 확인
      if (typeof Highcharts === "undefined") {
        console.error("Highcharts가 정의되어 있지 않습니다");
        return;
      }

      // 차트 인스턴스 객체 초기화 확인
      if (!window.chartInstances) {
        window.chartInstances = {};
      }

      // 기존 차트 인스턴스가 있으면 제거
      if (window.chartInstances[containerId]) {
        try {
          window.chartInstances[containerId].destroy();
        } catch (e) {
          console.warn(`기존 차트 제거 오류 (${containerId}):`, e);
        }
      }

      // 데이터 유효성 검사
      if (!data) {
        console.error(`유효하지 않은 차트 데이터: ${containerId}`);
        return;
      }

      // 차트 생성
      const chart = Highcharts.chart(containerId, {
        chart: {
          type: data.type || "column",
        },
        title: {
          text: data.title || "Chart",
        },
        subtitle: {
          text: data.subtitle || "",
        },
        xAxis: {
          categories: data.categories || [],
          crosshair: true,
          accessibility: {
            description: "Categories",
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: data.yAxisTitle || "",
          },
        },
        tooltip: {
          valueSuffix: data.valueSuffix || "",
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: data.list,
      });

      // 차트 인스턴스 저장
      window.chartInstances[containerId] = chart;

      return chart;
    } catch (error) {
      console.error(`차트 생성 중 오류 (${containerId}):`, error);
      return null;
    }
  }
}
