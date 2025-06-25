import ChartConfigManager from "./ChartConfigManager.js"
import { fetchData } from "./fetchData.js"
import Dialog from "./dialog.js"
import renderGrid from "./renderGrid/renderGrid.js"
import showConfirmation from "./confirmation/confirmation.js"
import addController from "./addController/addController.js"
import { getTypeText } from "./utils/localStorageUtils.js"
// import Highcharts from "highcharts"

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

const dialog = new Dialog()

export default function ChartTaskManager() {
  // 전역 변수 선언
  let currentTaskToDelete = null
  let chartConfigManagerInstance = null
  let tasks = []
  let originalTasks = [] // 원본 작업 데이터 저장용
  let currentEditingTaskId = null // 🔧 현재 편집 중인 task ID 추가s

  // 🔧 Task별 독립적인 선택 데이터 저장소 추가
  const taskSelectionData = new Map() // taskId -> selectionData

  const quickChartButton = document.querySelectorAll(".quick--chart--button")

  // 페이지 로드 시 초기화 함수
  document.addEventListener("DOMContentLoaded", init)

  // 모달 닫기 함수들을 전역 스코프에 정의
  window.closeModal = () => {
    const modal = document.getElementById("taskModal")
    if (modal) modal.classList.remove("show")
    // 🔧 모달 닫을 때 현재 편집 중인 task ID 초기화
    currentEditingTaskId = null
    return !!modal
  }

  window.closeHelpModal = () => {
    const modal = document.getElementById("helpModal")
    if (modal) modal.classList.remove("show")
    return !!modal
  }

  // 창 크기 조정 시 차트 다시 렌더링
  window.addEventListener("resize", () => {
    renderCharts()
  })

  // Task별 선택 데이터 관리 함수들 추가
  function saveTaskSelectionData(taskId, selectionData) {
    if (!taskId || !selectionData) return

    // 깊은 복사로 데이터 독립성 보장
    const independentData = JSON.parse(JSON.stringify(selectionData))
    taskSelectionData.set(taskId, independentData)

    console.log(`Task ${taskId} 선택 데이터 저장:`, independentData)
  }

  function getTaskSelectionData(taskId) {
    if (!taskId) return null

    const data = taskSelectionData.get(taskId)
    return data ? JSON.parse(JSON.stringify(data)) : null
  }

  function clearTaskSelectionData(taskId) {
    if (taskId) {
      taskSelectionData.delete(taskId)
      console.log(`Task ${taskId} 선택 데이터 삭제됨`)
    }
  }

  // 🔧 현재 편집 중인 task의 선택 데이터 가져오기
  function getCurrentTaskSelectionData() {
    if (!currentEditingTaskId) {
      console.warn("현재 편집 중인 task가 없습니다")
      return null
    }

    return getTaskSelectionData(currentEditingTaskId)
  }

  // 로컬스토리지 완전 정리 함수 추가
  function clearLocalStorageCompletely() {
    try {
      // tasks 관련 모든 키 제거
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes("task") || key.includes("chart") || key === "tasks")) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key)
        console.log(`로컬스토리지에서 제거됨: ${key}`)
      })

      // 🔧 Task 선택 데이터도 초기화
      taskSelectionData.clear()
      console.log("Task 선택 데이터 맵 초기화됨")

      console.log("로컬스토리지 완전 정리 완료")
    } catch (error) {
      console.error("로컬스토리지 정리 중 오류:", error)
    }
  }

  // 로컬 스토리지에 작업 저장 함수 개선
  function saveTasksToLocalStorage() {
    try {
      // 기존 tasks 데이터 완전 제거
      localStorage.removeItem("tasks")

      // 유효한 작업만 필터링
      const validTasks = tasks.filter((task) => task && task.id && task.title && task.column)

      // 새로운 데이터 저장
      localStorage.setItem("tasks", JSON.stringify(validTasks))

      console.log(`로컬스토리지에 ${validTasks.length}개 작업 저장됨:`, validTasks)

      // 저장 후 검증
      const savedData = JSON.parse(localStorage.getItem("tasks") || "[]")
      console.log("저장 검증:", savedData)
    } catch (error) {
      console.error("로컬스토리지 저장 중 오류:", error)
    }
  }

  // 삭제 확인 함수 개선
  function confirmDelete() {
    if (!currentTaskToDelete) {
      console.error("삭제할 작업 ID가 없습니다")
      document.getElementById("deleteConfirmationModal").classList.remove("show")
      return
    }

    console.log(`삭제 시작: ${currentTaskToDelete}`)
    console.log("삭제 전 tasks 배열:", tasks)

    // 1. tasks 배열에서 제거
    const taskToDeleteIndex = tasks.findIndex((t) => t.id === currentTaskToDelete)
    if (taskToDeleteIndex === -1) {
      console.error("삭제할 작업을 찾을 수 없습니다")
      document.getElementById("deleteConfirmationModal").classList.remove("show")
      return
    }

    const deletedTask = tasks[taskToDeleteIndex]
    const columnId = deletedTask.column

    // 배열에서 제거
    tasks.splice(taskToDeleteIndex, 1)
    console.log("삭제 후 tasks 배열:", tasks)

    // 2. originalTasks 배열에서도 제거
    const originalTaskIndex = originalTasks.findIndex((t) => t.id === currentTaskToDelete)
    if (originalTaskIndex !== -1) {
      originalTasks.splice(originalTaskIndex, 1)
      console.log("originalTasks에서도 제거됨")
    }

    // 🔧 3. Task 선택 데이터도 제거
    clearTaskSelectionData(currentTaskToDelete)

    // 4. DOM에서 제거
    const taskElement = document.querySelector(`[data-task-id="${currentTaskToDelete}"]`)
    if (taskElement) {
      taskElement.remove()
      console.log("DOM에서 제거됨")
    }

    // 5. 차트 인스턴스 제거
    if (window.chartInstances) {
      Object.keys(window.chartInstances).forEach((key) => {
        if (key.includes(currentTaskToDelete)) {
          try {
            if (window.chartInstances[key] && typeof window.chartInstances[key].destroy === "function") {
              window.chartInstances[key].destroy()
            }
            delete window.chartInstances[key]
            console.log(`차트 인스턴스 제거됨: ${key}`)
          } catch (e) {
            console.error("차트 인스턴스 제거 오류:", e)
          }
        }
      })
    }

    // 6. 로컬스토리지에 저장 (중요!)
    saveTasksToLocalStorage()

    // 7. 컬럼에 add-task 버튼 다시 표시
    const column = document.getElementById(columnId)
    if (column && !column.querySelector(".task")) {
      const addTaskButton = column.querySelector(".add-task")
      if (addTaskButton) addTaskButton.style.display = "flex"
    }

    // 8. 그리드 다시 렌더링
    renderGrid(tasks)

    // 9. 모달 닫기 및 상태 초기화
    document.getElementById("deleteConfirmationModal").classList.remove("show")
    currentTaskToDelete = null

    // 10. 성공 메시지
    showConfirmation("삭제를 성공하였습니다.")

    console.log("삭제 완료")

    // 11. 로컬스토리지 상태 확인
    const currentStorage = JSON.parse(localStorage.getItem("tasks") || "[]")
    console.log("삭제 후 로컬스토리지 상태:", currentStorage)
  }

  // 원본 데이터 복원 함수 개선
  async function restoreOriginalTasks() {
    try {
      console.log("원본 작업 데이터 복원 시작")
      console.log("복원할 원본 데이터:", originalTasks)

      // 현재 tasks 배열 완전 초기화
      tasks.length = 0

      // 원본 데이터로 교체 (깊은 복사)
      originalTasks.forEach((task) => tasks.push(JSON.parse(JSON.stringify(task))))

      console.log("원본 작업 데이터 복원 완료:", tasks)

      // 화면에서 모든 작업 요소 제거
      document.querySelectorAll(".task").forEach((taskEl) => taskEl.remove())

      // 로컬스토리지에 복원된 데이터 저장
      saveTasksToLocalStorage()

      // 작업 다시 렌더링
      loadTasks()

      // 그리드 다시 렌더링
      renderGrid(tasks)

      // 차트 다시 렌더링
      await renderCharts()
    } catch (error) {
      console.error("작업 데이터 복원 중 오류 발생:", error)
      showConfirmation("데이터 복원 중 오류가 발생했습니다.")
    }
  }

  async function renderCharts() {
    try {
      // 차트 인스턴스 객체 초기화 확인
      if (!window.chartInstances) {
        window.chartInstances = {}
      }

      // 기존 차트 인스턴스 완전 정리
      Object.keys(window.chartInstances).forEach((id) => {
        try {
          if (window.chartInstances[id] && typeof window.chartInstances[id].destroy === "function") {
            window.chartInstances[id].destroy()
          }
        } catch (e) {
          console.error("차트 인스턴스 제거 오류:", e)
        }
        delete window.chartInstances[id]
      })

      // 객체 재초기화
      window.chartInstances = {}

      const chartContainers = document.querySelectorAll(".grid--info--area")

      // 각 task에 대해 개별적으로 서버 요청
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        const requestId = task.buttonId || task.id

        try {
          // 각 요청마다 고유한 타임스탬프 추가하여 캐시 방지
          const chartData = await fetchData(`http://localhost:3000/hichartData?id=${requestId}&t=${Date.now()}`)

          if (chartContainers[i]) {
            const container = chartContainers[i]
            const containerId = container.getAttribute("id")

            if (!containerId) {
              console.warn(`컨테이너 ${i}에 ID가 없습니다`)
              continue
            }

            // 고유한 컨테이너 ID 생성
            const uniqueContainerId = `${containerId}-${Date.now()}-${i}`
            container.setAttribute("id", uniqueContainerId)

            // 차트 렌더링
            createHighChart(chartData, uniqueContainerId, task)
            console.log(`Task ${i + 1} 차트 렌더링 완료: ${uniqueContainerId}`)
          }
        } catch (error) {
          console.error(`Task ${i + 1} 데이터 요청 오류:`, error)
        }
      }

      setTimeout(() => {
        dialog.close()
      }, 500)
    } catch (error) {
      console.error("차트 데이터 가져오기 오류:", error)
    }
  }

  // 초기화 함수
  async function init() {
    console.log("DOM 로드 완료, 초기화 실행")

    // 디버깅을 위한 로컬스토리지 상태 확인 함수 추가
    window.checkLocalStorage = () => {
      console.log("=== 로컬스토리지 상태 확인 ===")
      console.log("tasks 배열:", tasks)
      console.log("originalTasks 배열:", originalTasks)
      console.log("로컬스토리지 tasks:", JSON.parse(localStorage.getItem("tasks") || "[]"))
      console.log("Task 선택 데이터 맵:", taskSelectionData)
      console.log("로컬스토리지 전체 키:", Object.keys(localStorage))
      console.log("===============================")
    }

    window.resetLocalStorage = () => {
      clearLocalStorageCompletely()
      tasks.length = 0
      originalTasks.length = 0
      document.querySelectorAll(".task").forEach((taskEl) => taskEl.remove())
      console.log("로컬스토리지 및 작업 데이터 완전 초기화됨")
    }

    // 로컬스토리지 상태 확인
    console.log("초기화 시 로컬스토리지 상태:", localStorage.getItem("tasks"))

    // 로컬 스토리지에서 작업 불러오기 (에러 처리 강화)
    let storedTasks = []
    try {
      const storedData = localStorage.getItem("tasks")
      if (storedData) {
        storedTasks = JSON.parse(storedData)
        storedTasks = storedTasks.filter((task) => task && task.id && task.title && task.column)

        // 🔧 저장된 task들의 combinationChart 데이터를 taskSelectionData에 복원
        storedTasks.forEach((task) => {
          if (task.chartType === "chart-3" && task.combinationChart) {
            saveTaskSelectionData(task.id, task.combinationChart)
          }
        })
      }
    } catch (error) {
      console.error("로컬스토리지 데이터 파싱 오류:", error)
      storedTasks = []
    }
    tasks = storedTasks

    // 원본 데이터 깊은 복사로 저장
    originalTasks = JSON.parse(JSON.stringify(tasks))

    // 기본 작업이 없으면 샘플 작업 추가
    if (!tasks || tasks.length === 0) {
      tasks = [
        {
          id: "default1",
          column: "type01",
          title: "테스트 차트1",
          color: "#215285",
          chartType: "chart-1",
          buttonTitle: "첫페이지",
          buttonId: "0000",
          buttonComment: "주석입니다.",
        },
        {
          id: "default2",
          column: "type02",
          title: "테스트 차트2",
          color: "#215285",
          chartType: "chart-1",
          buttonTitle: "첫페이지",
          buttonId: "0000",
          buttonComment: "주석입니다.",
        },
      ]
      localStorage.setItem("tasks", JSON.stringify(tasks))
      saveTasksToLocalStorage()
    }

    // 중복 제거 및 필터링
    const uniqueTasks = []
    const seenColumns = new Set()
    tasks.forEach((task) => {
      if (!seenColumns.has(task.column)) {
        seenColumns.add(task.column)
        uniqueTasks.push(task)
      }
    })
    tasks = uniqueTasks.filter((task) => task.column && task.title)

    // 이벤트 리스너 설정
    setupEventListeners()

    // 작업 로드 및 그리드 렌더링
    loadTasks()
    renderGrid(tasks)

    // 모달 닫기 버튼 설정
    setupModalCloseButtons()

    // ChartConfigManager 초기화
    chartConfigManagerInstance = ChartConfigManager()

    // 차트 렌더링 - 페이지 로드 시 실행
    await renderCharts()
  }

  // 이벤트 리스너 설정 함수
  function setupEventListeners() {
    // 모달 닫기 이벤트
    document.addEventListener("click", (e) => {
      if (e.target?.classList?.contains("modal__close")) {
        window.closeModal()
        e.preventDefault()
        e.stopPropagation()
      }
      if (e.target?.classList?.contains("help-modal__close") || e.target?.closest(".help-modal__close")) {
        window.closeHelpModal()
        e.preventDefault()
        e.stopPropagation()
      }

      // 모달 외부 클릭 시 닫기
      if (
        e.target === document.getElementById("taskModal") &&
        document.getElementById("taskModal")?.classList.contains("show")
      ) {
        window.closeModal()
      }
      if (
        e.target === document.getElementById("helpModal") &&
        document.getElementById("helpModal")?.classList.contains("show")
      ) {
        window.closeHelpModal()
      }
    })

    // ESC 키 누를 때 모달 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.closeModal()
        window.closeHelpModal()
        dialog.close()
        restoreOriginalTasks()
      }
    })

    // 삭제 확인 버튼
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", confirmDelete)

    // 삭제 취소 버튼
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn")
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", cancelDelete)

    // 작업 폼 제출 이벤트
    const taskForm = document.getElementById("taskForm")
    if (taskForm) {
      taskForm.addEventListener("submit", handleTaskFormSubmit)
    }

    // 컬럼 드래그 앤 드롭 이벤트
    setupColumnDragEvents()

    // 작업 추가 버튼 이벤트
    document.querySelectorAll(".add-task").forEach((button) => {
      button.addEventListener("click", function () {
        openModal(this.closest(".column").id)
      })
    })

    // 도움말 토글 버튼
    const helpToggle = document.getElementById("helpToggle")
    if (helpToggle) {
      helpToggle.addEventListener("click", () => {
        const helpModal = document.getElementById("helpModal")
        if (helpModal) helpModal.classList.add("show")
      })
    }

    // 🔧 설정 저장 버튼 - 편집 모드와 새 작업 모드 모두 지원 (수정됨)
    const settingBtn = document.getElementById("settingBtn")
    if (settingBtn) {
      settingBtn.addEventListener("click", async (e) => {
        e.preventDefault()
        e.stopPropagation()
        quickChartButton.forEach((item) => {
          item.classList.remove("--active")
        })

        console.log("=== settingBtn 클릭 시작 ===")

        // 🔧 현재 편집 중인 task 확인 (편집 모드와 새 작업 모드 구분)
        const taskForm = document.getElementById("taskForm")
        const editingTaskId = taskForm ? taskForm.dataset.editId : null
        const isEditMode = !!editingTaskId
        const isNewTaskMode = !editingTaskId

        console.log("편집 모드:", isEditMode, "새 작업 모드:", isNewTaskMode)
        console.log("현재 편집 중인 task ID:", editingTaskId)

        // 🔧 편집 모드인 경우 - 기존 task에 데이터 저장
        if (isEditMode) {
          const currentTask = tasks.find((t) => t.id === editingTaskId)
          if (!currentTask) {
            console.warn("현재 편집 중인 task를 찾을 수 없습니다")
            showConfirmation("설정이 저장되었습니다! ⚙️")
            return
          }

          console.log("편집 전 currentTask:", JSON.stringify(currentTask, null, 2))

          // chart-3 타입인 경우에만 보험 선택기 데이터 처리
          if (currentTask.chartType === "chart-3") {
            console.log(`Task ${editingTaskId}는 chart-3 타입 - 보험 선택기 데이터 저장`)

            // 🔧 보험 선택기에서 현재 선택 데이터 가져오기 (강제 새로고침)
            let selectionData = null
            if (window.insuranceSelector && typeof window.insuranceSelector.getSelection === "function") {
              try {
                // 보험 선택기 상태 강제 새로고침
                if (typeof window.insuranceSelector.refreshSelection === "function") {
                  window.insuranceSelector.refreshSelection()
                }

                selectionData = window.insuranceSelector.getSelection()
                console.log("보험 선택기에서 가져온 원본 데이터:", selectionData)

                // 🔧 데이터 검증 및 보정
                if (selectionData) {
                  // 깊은 복사로 데이터 독립성 보장
                  selectionData = JSON.parse(JSON.stringify(selectionData))

                  // chartCombinations 검증
                  if (!selectionData.chartCombinations || selectionData.chartCombinations.length === 0) {
                    console.warn("chartCombinations가 비어있음 - 강제 재생성")

                    // 강제로 차트 조합 재생성
                    const nodes = selectionData.selectedNodes || selectionData.nodes || []
                    const stateItems = selectionData.selectedStateItems || []

                    if (nodes.length > 0 && stateItems.length > 0) {
                      const newCombinations = []
                      nodes.forEach((node) => {
                        stateItems.forEach((stateItem) => {
                          newCombinations.push({
                            id: node.id,
                            parentId: node.parentId || null,
                            title: node.title,
                            level: node.level || 3,
                            stateItemId: stateItem.id,
                            stateItemName: stateItem.name,
                            stateItemUnit: stateItem.unit,
                            combinedId: `${node.id}_${stateItem.id}`,
                            combinedTitle: `${node.title} - ${stateItem.name}`,
                            chartType: "column",
                            useSecondaryAxis: false,
                            nodeId: node.id,
                            nodeTitle: node.title,
                          })
                        })
                      })

                      selectionData.chartCombinations = newCombinations
                      selectionData.count = newCombinations.length
                      console.log("차트 조합 강제 재생성 완료:", newCombinations)
                    }
                  }

                  console.log("현재 보험 선택기 데이터 (검증 후):", selectionData)
                }
              } catch (error) {
                console.error("getSelection() 호출 중 오류:", error)
              }
            }

            // 🔧 이전 데이터와 비교
            const previousData = currentTask.combinationChart
            console.log("이전 데이터:", previousData)
            console.log("새 데이터:", selectionData)

            // 현재 편집 중인 task에만 데이터 저장
            if (selectionData) {
              currentTask.combinationChart = selectionData
              saveTaskSelectionData(editingTaskId, selectionData)
              console.log(`Task ${editingTaskId}에만 combinationChart 데이터 저장:`, selectionData)

              // 🔧 데이터 변경 확인
              const dataChanged = JSON.stringify(previousData) !== JSON.stringify(selectionData)
              console.log("데이터 변경됨:", dataChanged)
            } else {
              console.warn("저장할 보험 선택 데이터가 없습니다")
              currentTask.combinationChart = null
            }

            // 🔧 ChartConfigManager의 saveInsuranceSelectorData 호출 (강제)
            if (
              chartConfigManagerInstance &&
              typeof chartConfigManagerInstance.saveInsuranceSelectorData === "function"
            ) {
              console.log("ChartConfigManager saveInsuranceSelectorData 호출")
              chartConfigManagerInstance.saveInsuranceSelectorData()
            }
          } else {
            console.log(`Task ${editingTaskId}는 chart-3 타입이 아님 - 보험 선택기 데이터 처리 건너뜀`)
          }

          console.log("편집 후 currentTask:", JSON.stringify(currentTask, null, 2))

          // 🔧 로컬 스토리지에 작업 저장 (강제)
          console.log("로컬스토리지 저장 전 tasks:", tasks)
          saveTasksToLocalStorage()

          // 저장 후 즉시 확인
          const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
          const savedCurrentTask = savedTasks.find((t) => t.id === editingTaskId)
          console.log(`저장된 Task ${editingTaskId}:`, savedCurrentTask)

          // 🔧 UI 강제 업데이트 (즉시 실행)
          console.log("UI 강제 업데이트 시작")

          // 해당 task의 DOM 요소 찾아서 업데이트
          const taskElement = document.querySelector(`[data-task-id="${editingTaskId}"]`)
          if (taskElement) {
            const taskBody = taskElement.querySelector(".task__body span")
            if (taskBody && currentTask.chartType === "chart-3" && currentTask.combinationChart) {
              // HTML 업데이트
              const newHTML = currentTask.combinationChart.chartCombinations
                ? `<div style="display:flex;gap:5px;justify-content: center;">
                  ${[...new Set(currentTask.combinationChart.chartCombinations.map((item) => item.title))]
                    .map((title) => `<span style="font-weight:bold;">${title}</span>`)
                    .join("&nbsp;")}
                  </div>
                  <div style="display:flex;gap:5px;margin-top:10px;">
                    ${[...new Set(currentTask.combinationChart.chartCombinations.map((item) => item.stateItemName))]
                      .map(
                        (stateName) =>
                          `<span style="display:flex;border-radius:15px;background-color:#dfdfdf;padding:5px 10px;font-size:12px;font-weight:500;color:#333;">${stateName}</span>`,
                      )
                      .join("")}
                  </div>`
                : currentTask.buttonTitle || "데이터 없음"

              taskBody.innerHTML = newHTML
              console.log("Task DOM 업데이트 완료")
            }
          }

          // 🔧 originalTasks도 즉시 업데이트 (중요!)
          const originalTaskIndex = originalTasks.findIndex((t) => t.id === editingTaskId)
          if (originalTaskIndex !== -1) {
            originalTasks[originalTaskIndex] = JSON.parse(JSON.stringify(currentTask))
            console.log("originalTasks도 업데이트됨")
          }

          // 사용자 알림
          if (
            currentTask.chartType === "chart-3" &&
            currentTask.combinationChart &&
            currentTask.combinationChart.count > 0
          ) {
            showConfirmation(
              `설정이 저장되었습니다! 📊\n선택된 보험종목: ${currentTask.combinationChart.count}개\n분류: ${getTypeText(currentTask.combinationChart.type)}`,
            )
          } else {
            showConfirmation("설정이 저장되었습니다! ⚙️")
          }

          // 🔧 그리드 렌더링 및 차트 업데이트는 마지막에 (비동기)
          setTimeout(async () => {
            console.log("그리드 및 차트 업데이트 시작")

            // 그리드 다시 렌더링
            renderGrid(tasks)

            // 차트 다시 렌더링
            await renderCharts()

            console.log("그리드 및 차트 업데이트 완료")
          }, 100)
        }
        // 🔧 새 작업 모드인 경우 - 임시로 전역 변수에 데이터 저장
        else if (isNewTaskMode) {
          console.log("새 작업 모드 - 보험 선택기 데이터 임시 저장")

          // 현재 선택된 차트 타입 확인
          const chartTypeInput = document.getElementById("chartType")
          const currentChartType = chartTypeInput ? chartTypeInput.value : null

          if (currentChartType === "chart-3") {
            // 보험 선택기에서 현재 선택 데이터 가져오기
            let selectionData = null
            if (window.insuranceSelector && typeof window.insuranceSelector.getSelection === "function") {
              try {
                // 보험 선택기 상태 강제 새로고침
                if (typeof window.insuranceSelector.refreshSelection === "function") {
                  window.insuranceSelector.refreshSelection()
                }

                selectionData = window.insuranceSelector.getSelection()
                if (selectionData) {
                  // 깊은 복사로 데이터 독립성 보장
                  selectionData = JSON.parse(JSON.stringify(selectionData))
                  console.log("새 작업용 보험 선택기 데이터 (깊은 복사):", selectionData)

                  // 🔧 새 작업용 임시 데이터 저장 (전역 변수 사용)
                  window.tempNewTaskSelectionData = selectionData
                  console.log("새 작업용 임시 데이터 저장 완료:", selectionData)
                }
              } catch (error) {
                console.error("getSelection() 호출 중 오류:", error)
              }
            }

            // 사용자 알림
            if (selectionData && selectionData.count > 0) {
              showConfirmation(
                `설정이 저장되었습니다! 📊\n선택된 보험종목: ${selectionData.count}개\n분류: ${getTypeText(selectionData.type)}`,
              )
            } else {
              showConfirmation("설정이 저장되었습니다! ⚙️")
            }
          } else {
            console.log("새 작업이 chart-3 타입이 아님 - 보험 선택기 데이터 처리 건너뜀")
            showConfirmation("설정이 저장되었습니다! ⚙️")
          }
        }
        // 🔧 예외 상황
        else {
          console.warn("편집 모드도 새 작업 모드도 아닌 상황")
          showConfirmation("설정이 저장되었습니다! ⚙️")
        }

        console.log("=== settingBtn 클릭 완료 ===")
      })

      // 폼 제출 방지를 위한 추가 조치
      const parentForm = settingBtn.closest("form")
      if (parentForm) {
        parentForm.addEventListener("submit", (e) => {
          e.preventDefault()
          return false
        })
      }
    }

    // 취소 버튼
    const cancelBtn = document.getElementById("cancelBtn")
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        console.log("취소 버튼 클릭: 변경사항 취소 및 원본 데이터 복원")
        dialog.close()
        restoreOriginalTasks()
      })
    }
  }

  // 컬럼 드래그 앤 드롭 이벤트 설정
  function setupColumnDragEvents() {
    const columns = document.querySelectorAll(".column")
    columns.forEach((column) => {
      column.addEventListener("dragover", (e) => {
        e.preventDefault()
        if (document.querySelector(".dragging")) column.classList.add("drag-over")
      })

      column.addEventListener("dragleave", () => column.classList.remove("drag-over"))

      column.addEventListener("drop", (e) => {
        e.preventDefault()
        column.classList.remove("drag-over")
        const taskId = e.dataTransfer.getData("text/plain")
        if (!taskId) return

        const draggedTask = tasks.find((t) => t.id === taskId)
        console.log("드래그된 작업:", draggedTask)
        if (!draggedTask) return

        const sourceColumnId = draggedTask.column
        const targetColumnId = column.id
        if (sourceColumnId === targetColumnId) return

        const targetTask = tasks.find((t) => t.column === targetColumnId)
        draggedTask.column = targetColumnId
        if (targetTask) targetTask.column = sourceColumnId

        tasks.forEach((task, index) => {
          if (task.id === draggedTask.id) {
            task.column = targetColumnId
          } else if (task.column === targetColumnId) {
            task.column = sourceColumnId
          }
        })
        document.querySelectorAll(".task").forEach((taskEl) => taskEl.remove())
        tasks.forEach(renderTask)
        addController()

        // 드래그 앤 드롭 후 로컬스토리지 저장
        saveTasksToLocalStorage()
      })
    })
  }

  // 모달 닫기 버튼 설정
  function setupModalCloseButtons() {
    setTimeout(() => {
      document
        .querySelectorAll(".modal__close")
        .forEach((btn) => btn.setAttribute("onclick", "window.closeModal(); return false;"))

      document
        .querySelectorAll(".help-modal__close")
        .forEach((btn) => btn.setAttribute("onclick", "window.closeHelpModal(); return false;"))

      // 모달에 닫기 버튼이 없으면 추가
      const taskModal = document.getElementById("taskModal")
      if (taskModal && !taskModal.querySelector(".modal__close")) {
        const closeBtn = document.createElement("button")
        closeBtn.className = "modal__close"
        closeBtn.innerHTML = "×"
        Object.assign(closeBtn.style, {
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "24px",
          background: "none",
          border: "none",
          cursor: "pointer",
        })
        const modalHeader = taskModal.querySelector("h2")?.parentNode
        ;(modalHeader || taskModal).insertBefore(closeBtn, modalHeader ? modalHeader.firstChild : taskModal.firstChild)
        closeBtn.onclick = () => {
          window.closeModal()
          return false
        }
      }

      const helpModal = document.getElementById("helpModal")
      if (helpModal && !helpModal.querySelector(".help-modal__close")) {
        const closeBtn = document.createElement("button")
        closeBtn.className = "help-modal__close"
        closeBtn.innerHTML = "×"
        Object.assign(closeBtn.style, {
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "24px",
          background: "none",
          border: "none",
          cursor: "pointer",
        })
        const modalHeader = helpModal.querySelector("h2")?.parentNode
        ;(modalHeader || helpModal).insertBefore(closeBtn, modalHeader ? modalHeader.firstChild : helpModal.firstChild)
        closeBtn.onclick = () => {
          window.closeHelpModal()
          return false
        }
      }
    }, 1000)

    // DOM 변경 감지하여 새로 추가된 요소에 이벤트 리스너 추가
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              node.querySelectorAll(".modal__close").forEach((btn) => {
                btn.onclick = () => {
                  window.closeModal()
                  return false
                }
              })
              node.querySelectorAll(".help-modal__close").forEach((btn) => {
                btn.onclick = () => {
                  window.closeHelpModal()
                  return false
                }
              })
            }
          })
        }
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  // 작업 폼 제출 처리 함수
  function handleTaskFormSubmit(e) {
    e.preventDefault()

    // #selectList 버튼 유효성 검사
    const selectList = document.getElementById("selectList")
    const selectListLabel = document.getElementById("selectListLabel")
    if (selectList) {
      const hasSelectedButton = selectList.querySelector("button.selected") !== null
      if (!hasSelectedButton) {
        console.warn("선택된 버튼이 없습니다. 버튼을 선택해주세요.")
        selectList.classList.add("error")
        selectListLabel.classList.add("error")
        return
      }
    }

    const form = e.target
    const taskId = form.dataset.editId
    const title = document.getElementById("taskTitle").value
    const color = document.getElementById("taskColor").value
    const column = document.getElementById("columnType").value

    // 차트 타입 가져오기
    let chartType = document.getElementById("chartType").value
    if (!chartType && chartConfigManagerInstance) {
      chartType = chartConfigManagerInstance.getSelectedChartType()
    }

    // 선택된 버튼 정보 가져오기
    let buttonId = null
    let buttonTitle = null
    let buttonComment = null
    if (chartConfigManagerInstance) {
      const selectedButton = chartConfigManagerInstance.getSelectedButton()
      if (selectedButton) {
        buttonId = selectedButton.id
        buttonTitle = selectedButton.title
        buttonComment = selectedButton.comment
        console.log("선택된 버튼 정보:", { buttonId, buttonTitle, buttonComment })
      }
    }

    // 🔧 combinationChart 데이터 가져오기 - 편집/새 작업 모드 구분
    let combinationChart = null
    if (chartType === "chart-3") {
      if (taskId) {
        // 편집 모드: 저장된 데이터 사용
        combinationChart = getTaskSelectionData(taskId)
      } else {
        // 새 작업 모드: 임시 저장된 데이터 우선 사용, 없으면 현재 보험 선택기 상태 사용
        if (window.tempNewTaskSelectionData) {
          combinationChart = JSON.parse(JSON.stringify(window.tempNewTaskSelectionData))
          console.log("새 작업: 임시 저장된 데이터 사용:", combinationChart)
          // 사용 후 임시 데이터 삭제
          delete window.tempNewTaskSelectionData
        } else if (window.insuranceSelector && typeof window.insuranceSelector.getSelection === "function") {
          const rawData = window.insuranceSelector.getSelection()
          combinationChart = rawData ? JSON.parse(JSON.stringify(rawData)) : null
          console.log("새 작업: 현재 보험 선택기 상태 사용:", combinationChart)
        }
      }
      console.log("combinationChart 데이터:", combinationChart)
    }

    if (taskId) {
      // 기존 작업 수정
      const taskIndex = tasks.findIndex((t) => t.id === taskId)
      if (taskIndex !== -1) {
        const parentColumn = document.querySelector(`[data-task-id="${taskId}"]`)?.closest(".column")?.id

        tasks[taskIndex] = {
          ...tasks[taskIndex],
          title,
          color,
          column,
          chartType,
          buttonId,
          buttonTitle,
          combinationChart,
          buttonComment,
        }

        // 🔧 편집 모드에서 taskSelectionData Map도 업데이트
        if (chartType === "chart-3" && combinationChart) {
          saveTaskSelectionData(taskId, combinationChart)
          console.log(`편집 완료: Task ${taskId} 선택 데이터 업데이트됨`)
        }

        if (parentColumn !== column && document.querySelector(`[data-task-id="${taskId}"]`)) {
          document.querySelector(`[data-task-id="${taskId}"]`).remove()
        }
        renderTask(tasks[taskIndex], parentColumn === column)
      }
      delete form.dataset.editId
    } else {
      // 새 작업 생성
      const newTaskId = Date.now().toString()
      const newTask = {
        id: newTaskId,
        title,
        color,
        column,
        chartType,
        buttonId,
        buttonTitle,
        combinationChart,
        buttonComment,
      }

      // 🔧 새 작업의 선택 데이터도 저장
      if (chartType === "chart-3" && combinationChart) {
        saveTaskSelectionData(newTaskId, combinationChart)
      }

      tasks.push(newTask)
      renderTask(newTask)
    }

    // 로컬 스토리지에 작업 저장
    saveTasksToLocalStorage()

    // 🔧 편집 중인 task ID 초기화
    currentEditingTaskId = null

    window.closeModal()
    showConfirmation(taskId ? "차트 수정을 성공하였습니다!" : "차트 생성을 성공하였습니다!")
  }

  /* -------------------------------------------------------------------------- */
  /*                                 바로가기 및 초기화                         */
  /* -------------------------------------------------------------------------- */

  async function handleTaskUpdate(data, showLoading = false, buttonElement = null) {
    try {
      // 🔧 기존 데이터 완전 초기화
      clearLocalStorageCompletely()
      tasks = []
      document.querySelectorAll(".task").forEach((taskEl) => taskEl.remove())
      originalTasks.length = 0

      // 🔧 데이터 깊은 복사로 독립성 보장 및 taskSelectionData 복원
      data.forEach((task) => {
        const taskCopy = JSON.parse(JSON.stringify(task))
        tasks.push(taskCopy)
        originalTasks.push(JSON.parse(JSON.stringify(taskCopy)))

        // 🔧 chart-3 타입인 경우 taskSelectionData Map에 복원
        if (taskCopy.chartType === "chart-3" && taskCopy.combinationChart) {
          console.log(`Task ${taskCopy.id} combinationChart 데이터 복원:`, taskCopy.combinationChart)
          saveTaskSelectionData(taskCopy.id, taskCopy.combinationChart)
        }
      })

      console.log("tasks 업데이트 완료:", tasks)
      console.log("taskSelectionData Map 상태:", taskSelectionData)

      renderGrid(tasks)

      if (showLoading && buttonElement) {
        buttonElement.classList.add("loading")
      }

      await renderCharts()

      if (showLoading && buttonElement) {
        setTimeout(() => {
          buttonElement.classList.remove("loading")
        }, 500)
      }

      // 🔧 로컬스토리지 저장
      saveTasksToLocalStorage()

      showConfirmation("즐겨찾기 작업이 추가되었습니다! ⭐")
    } catch (error) {
      console.error("작업 업데이트 중 오류 발생:", error)

      if (showLoading && buttonElement) {
        buttonElement.classList.remove("loading")
      }

      showConfirmation("작업 업데이트 중 오류가 발생했습니다.")
    }
  }

  // 초기화데이터
  const refreshData = [
    {
      id: "1",
      title: "50대 주요 보험지표",
      color: "#215285",
      column: "type01",
      chartType: "chart-1",
      buttonId: "0",
      buttonTitle: "평균 기대 수명 및 건강 수명",
      buttonComment: "주석입니다.",
    },
    {
      id: "2",
      title: "50대 주요 보험지표",
      color: "#215285",
      column: "type02",
      chartType: "chart-1",
      buttonId: "2",
      buttonTitle: "의료 기술 발달에 따른 치료비 상승",
      buttonComment: "주석입니다.",
    },
  ]

  const boheomSaneobData = [
    {
      id: "1",
      title: "50대 주요 보험지표",
      color: "#215285",
      column: "type01",
      chartType: "chart-1",
      buttonId: "0",
      buttonTitle: "평균 기대 수명 및 건강 수명",
      buttonComment: "주석입니다.",
    },
    {
      id: "2",
      title: "50대 주요 보험지표",
      color: "#215285",
      column: "type02",
      chartType: "chart-1",
      buttonId: "2",
      buttonTitle: "의료 기술 발달에 따른 치료비 상승",
      buttonComment: "주석입니다.",
    },
    {
      id: "3",
      title: "50대 주요 보험지표",
      color: "#215285",
      column: "type03",
      chartType: "chart-1",
      buttonId: "4",
      buttonTitle: "자녀 독립 및 부양 의무 변화",
      buttonComment: "주석입니다.",
    },
    {
      id: "4",
      title: "50대 주요 보험지표",
      color: "#215285",
      column: "type04",
      chartType: "chart-1",
      buttonId: "4",
      buttonTitle: "자녀 독립 및 부양 의무 변화",
      buttonComment: "주석입니다.",
    },
  ]

  const refreshButton = document.getElementById("refresh")
  const boheomSaneobBtn = document.getElementById("boheomSaneobBtn")

  // Refresh 버튼 이벤트 리스너
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      quickChartButton.forEach((item) => {
        item.classList.remove("--active")
      })
      await handleTaskUpdate(refreshData, true, refreshButton)
    })
  }

  // 보험산업 버튼 이벤트 리스너
  if (boheomSaneobBtn) {
    boheomSaneobBtn.addEventListener("click", async () => {
      quickChartButton.forEach((item) => {
        item.classList.remove("--active")
      })
      boheomSaneobBtn.classList.add("--active")
      await handleTaskUpdate(boheomSaneobData, false)
    })
  }

  // 작업 로드
  function loadTasks() {
    document.querySelectorAll(".task").forEach((taskEl) => taskEl.remove())
    document.querySelectorAll(".task-list").forEach((taskList) => {
      const addTaskButton = taskList.querySelector(".add-task")
      while (taskList.firstChild) taskList.removeChild(taskList.firstChild)
      if (addTaskButton) taskList.appendChild(addTaskButton)
    })
    tasks.forEach(renderTask)
    addController()
  }

  // 작업 렌더링
  function renderTask(task, isUpdate = false) {
    const column = document.getElementById(task.column)
    const taskList = column?.querySelector(".task-list")
    if (!taskList) return

    const existingTask = taskList.querySelector(`.task[data-task-id="${task.id}"]`)
    if (existingTask && isUpdate) {
      existingTask.innerHTML = createTaskHTML(task)
      existingTask.style.border = `4px solid ${task.color}`
      existingTask.dataset.chartId = `${task.buttonId}`
      existingTask.querySelector(".edit-btn").addEventListener("click", () => openEditModal(task.id))
      existingTask.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id))
      return
    } else if (existingTask) {
      existingTask.remove()
    }

    const taskElement = document.createElement("div")
    taskElement.className = "task"
    taskElement.draggable = true
    taskElement.dataset.taskId = task.id
    taskElement.style.border = `4px solid ${task.color}`
    taskElement.dataset.chartId = `${task.buttonId}`

    taskElement.innerHTML = createTaskHTML(task)

    taskElement.addEventListener("dragstart", function (e) {
      this.classList.add("dragging")
      this.style.opacity = "0.5"
      e.dataTransfer.setData("text/plain", this.dataset.taskId)
    })

    taskElement.addEventListener("dragend", function () {
      this.classList.remove("dragging")
      this.style.opacity = "1"
      document.querySelectorAll(".column").forEach((col) => col.classList.remove("drag-over"))
    })

    const addTaskButton = taskList.querySelector(".add-task")
    if (addTaskButton) {
      addTaskButton.style.display = "none"
      taskList.insertBefore(taskElement, addTaskButton.nextSibling)
    } else {
      taskList.appendChild(taskElement)
    }

    taskElement.querySelector(".edit-btn").addEventListener("click", () => openEditModal(task.id))
    taskElement.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id))
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
    <div class="task__body" style="font-size:18px;font-weight:700;">
      <span>${
        task.chartType === "chart-3" && task.combinationChart && task.combinationChart.chartCombinations
          ? `<div style="display:flex;gap:5px;justify-content: center;">
              ${[...new Set(task.combinationChart.chartCombinations.map((item) => item.title))]
                .map((title) => `<span style="font-weight:bold;">${title}</span>`)
                .join("&nbsp;")}
              </div>
              <div style="display:flex;gap:5px;margin-top:10px;">
                ${[...new Set(task.combinationChart.chartCombinations.map((item) => item.stateItemName))]
                  .map(
                    (stateName) =>
                      `<span style="display:flex;border-radius:15px;background-color:#dfdfdf;padding:5px 10px;font-size:12px;font-weight:500;color:#333;">${stateName}</span>`,
                  )
                  .join("")}
              </div>`
          : task.buttonTitle || "데이터 없음"
      }</span>
    </div>
  `
  }

  // 🔧 작업 수정 모달 열기 함수 - 현재 편집 중인 task ID 설정
  function openEditModal(taskId) {
    // 현재 편집 중인 task ID 설정
    currentEditingTaskId = taskId

    // 모달 열기 전에 원본 데이터 백업
    originalTasks = JSON.parse(JSON.stringify(tasks))
    console.log("모달 열기: 원본 데이터 백업 완료", originalTasks)
    console.log("현재 편집 중인 task ID 설정:", currentEditingTaskId)

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    console.log("편집할 task 데이터:", task)

    const form = document.getElementById("taskForm")
    if (!form) return

    form.reset()
    form.dataset.editId = taskId

    document.getElementById("taskTitle").value = task.title.trim()
    document.getElementById("taskColor").value = task.color
    document.getElementById("columnType").value = task.column

    // 차트 타입 설정
    const chartTypeInput = document.getElementById("chartType")
    if (chartTypeInput) {
      chartTypeInput.value = task.chartType || ""
    }

    // ChartConfigManager에 차트 타입 설정
    if (chartConfigManagerInstance) {
      chartConfigManagerInstance.setChartType(task.chartType)

      // 🔧 chart-3 타입인 경우 저장된 선택 데이터로 보험 선택기 복원 (개선)
      if (task.chartType === "chart-3") {
        console.log("chart-3 타입 - 보험 선택기 데이터 복원 시작")

        // 여러 소스에서 데이터 찾기
        let savedSelectionData = null

        // 1. taskSelectionData Map에서 찾기
        savedSelectionData = getTaskSelectionData(taskId)
        console.log("taskSelectionData Map에서 가져온 데이터:", savedSelectionData)

        // 2. task 객체에서 직접 찾기
        if (!savedSelectionData && task.combinationChart) {
          savedSelectionData = task.combinationChart
          console.log("task.combinationChart에서 가져온 데이터:", savedSelectionData)
        }

        if (savedSelectionData && window.insuranceSelector) {
          // 보험 선택기 준비 대기
          const waitForInsuranceSelector = () => {
            if (window.insuranceSelector && typeof window.insuranceSelector.restoreSelection === "function") {
              try {
                console.log("보험 선택기 데이터 복원 시도:", savedSelectionData)
                window.insuranceSelector.restoreSelection(savedSelectionData)

                // 복원 후 검증
                setTimeout(() => {
                  const restoredData = window.insuranceSelector.getSelection()
                  console.log("복원 후 보험 선택기 상태:", restoredData)
                }, 500)

                console.log("보험 선택기 상태 복원 완료")
              } catch (error) {
                console.error("보험 선택기 상태 복원 실패:", error)
              }
            } else {
              console.log("보험 선택기 아직 준비되지 않음, 재시도...")
              setTimeout(waitForInsuranceSelector, 200)
            }
          }

          // 즉시 시도 및 지연 시도
          waitForInsuranceSelector()
          setTimeout(waitForInsuranceSelector, 500)
          setTimeout(waitForInsuranceSelector, 1000)
        } else {
          console.warn("복원할 보험 선택기 데이터가 없습니다")
        }
      }

      // 버튼 선택 상태 복원
      if (task.buttonId && task.buttonTitle) {
        trySelectButton()
        setTimeout(trySelectButton, 300)
        setTimeout(trySelectButton, 800)
      }

      function trySelectButton() {
        console.log("버튼 선택 시도:", task.buttonId)
        const selectListBox = document.getElementById("selectList")
        if (!selectListBox) {
          console.warn("selectList 요소를 찾을 수 없습니다")
          return
        }

        selectListBox.querySelectorAll("button").forEach((btn) => {
          selectListBox.classList.remove("error")
          btn.classList.remove("selected")
        })

        const targetButton = selectListBox.querySelector(`button[data-id="${task.buttonId}"]`)
        if (targetButton) {
          console.log("버튼 찾음, selected 클래스 추가:", task.buttonId)
          targetButton.classList.add("selected")

          if (chartConfigManagerInstance && typeof chartConfigManagerInstance.updateSelectedButton === "function") {
            chartConfigManagerInstance.updateSelectedButton(task.buttonId)
          }
        } else {
          console.warn(`ID가 ${task.buttonId}인 버튼을 찾을 수 없습니다`)
        }
      }
    }

    document.querySelector('#taskForm button[type="submit"]').textContent = "차트 수정"
    document.querySelector("#taskModal h2").textContent = "Edit Chart"

    const taskModal = document.getElementById("taskModal")
    if (taskModal) taskModal.classList.add("show")
  }

  // 🔧 새 작업 모달 열기 함수 - 현재 편집 중인 task ID 초기화
  function openModal(columnType) {
    // 새 작업이므로 현재 편집 중인 task ID 초기화
    currentEditingTaskId = null

    // 모달 열기 전에 원본 데이터 백업
    originalTasks = JSON.parse(JSON.stringify(tasks))
    console.log("모달 열기: 원본 데이터 백업 완료", originalTasks)
    console.log("새 작업 모달 - 현재 편집 중인 task ID 초기화")

    const form = document.getElementById("taskForm")
    if (form) {
      form.reset()
      delete form.dataset.editId
    }

    const columnTypeInput = document.getElementById("columnType")
    if (columnTypeInput) columnTypeInput.value = columnType

    // 차트 타입 초기화
    const chartTypeInput = document.getElementById("chartType")
    if (chartTypeInput) {
      chartTypeInput.value = ""
    }

    // ChartConfigManager 초기화 (첫 번째 버튼 선택)
    if (chartConfigManagerInstance) {
      const buttons = document.querySelectorAll("#chartRequestOptions .dialog--btn")
      if (buttons.length > 0) {
        buttons.forEach((btn) => btn.classList.remove("--active"))
        buttons[0].classList.add("--active")

        const defaultChartType = buttons[0].getAttribute("data-chart-type")
        if (chartTypeInput && defaultChartType) {
          chartTypeInput.value = defaultChartType
          chartConfigManagerInstance.setChartType(defaultChartType)

          setTimeout(() => {
            if (typeof chartConfigManagerInstance.resetSelectList === "function") {
              chartConfigManagerInstance.resetSelectList()
            }
          }, 300)
        }
      }
    }

    document.querySelector('#taskForm button[type="submit"]').textContent = "Add Chart"
    document.querySelector("#taskModal h2").textContent = "새 차트"

    const taskModal = document.getElementById("taskModal")
    if (taskModal) taskModal.classList.add("show")

    setTimeout(() => document.getElementById("taskTitle")?.focus(), 100)
  }

  // 작업 삭제 확인 모달 열기
  function deleteTask(taskId) {
    currentTaskToDelete = taskId
    document.getElementById("deleteConfirmationModal").classList.add("show")
  }

  // 삭제 취소
  function cancelDelete() {
    currentTaskToDelete = null
    document.getElementById("deleteConfirmationModal").classList.remove("show")
  }

  // createHighChart 함수
  function createHighChart(data, containerId, task) {
    try {
      const container = document.getElementById(containerId)
      if (!container) {
        console.error(`차트 컨테이너를 찾을 수 없습니다: ${containerId}`)
        return
      }

      if (typeof Highcharts === "undefined") {
        console.error("Highcharts가 정의되어 있지 않습니다")
        return
      }

      if (!window.chartInstances) {
        window.chartInstances = {}
      }

      if (window.chartInstances[containerId]) {
        try {
          window.chartInstances[containerId].destroy()
        } catch (e) {
          console.warn(`기존 차트 제거 오류 (${containerId}):`, e)
        }
      }

      if (!data) {
        console.error(`유효하지 않은 차트 데이터: ${containerId}`)
        return
      }

      const chart = Highcharts.chart(containerId, {
        chart: {
          zooming: {
            type: "xy",
          },
        },
        title: {
          text: "Karasjok weather, 2023",
          align: "left",
        },
        credits: {
          text:
            "Source: " +
            '<a href="https://www.yr.no/nb/historikk/graf/5-97251/Norge/Finnmark/Karasjok/Karasjok?q=2023"' +
            'target="_blank">YR</a>',
        },
        plotOptions: {
          series: {
            animation: {
              duration: 2500,
            },
          },
        },
        xAxis: [
          {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            crosshair: true,
          },
        ],
        yAxis: [
          {
            labels: {
              format: "{value}°C",
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            title: {
              text: "Temperature",
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
          },
          {
            title: {
              text: "Precipitation",
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            labels: {
              format: "{value} mm",
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            opposite: true,
          },
        ],
        tooltip: {
          shared: true,
        },
        legend: {
          align: "left",
          verticalAlign: "top",
          backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || "rgba(255,255,255,0.25)",
        },
        series: [
          {
            name: "Precipitation",
            type: "column",
            yAxis: 1,
            data: [45.7, 37.0, 28.9, 17.1, 39.2, 18.9, 90.2, 78.5, 74.6, 18.7, 17.1, 16.0],
            tooltip: {
              valueSuffix: " mm",
            },
          },
          {
            name: "Temperature",
            type: "spline",
            data: [-11.4, -9.5, -14.2, 0.2, 7.0, 12.1, 13.5, 13.6, 8.2, -2.8, -12.0, -15.5],
            tooltip: {
              valueSuffix: "°C",
            },
          },
        ],
      })

      window.chartInstances[containerId] = chart
      return chart
    } catch (error) {
      console.error(`차트 생성 중 오류 (${containerId}):`, error)
      return null
    }
  }
}
