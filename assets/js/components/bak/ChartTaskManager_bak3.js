import {
  updateUIByChartType,
  getSelectedChartType,
  setChartType,
  getSelectList,
  getChartOptionsData,
  getSelectedButton,
  prepareChartData,
} from "./chartUtils.js"

/* -------------------------------------------------------------------------- */
/*  파일명 : ChartConfigManager.js
/* -------------------------------------------------------------------------- */
/*  팝업UI관리                                                                     
/*  차트타입 선택                                                                     
/*  옵션설정
/*  데이터검색
/*  로컬 스토리지 저장
/*  차트 구성의 전반적인 관리                                     
/* -------------------------------------------------------------------------- */

const ChartConfigManager = () => {
  const chartType = document.querySelector("#chartRequestOptions")
  if (!chartType) {
    console.warn("Chart request options element not found")
    return null
  }

  const DOM = {
    chartTypeButton: chartType.querySelectorAll(".dialog--btn"),
  }

  const { chartTypeButton } = DOM

  // 초기 선택된 버튼 찾기
  let initialButton = Array.from(chartTypeButton).find((btn) => btn.classList.contains("--active"))
  let chartTypeValue = initialButton ? initialButton.getAttribute("data-chart-type") : null
  let selectList
  const chartOptionsData = {} // 차트 옵션 데이터 저장 객체

  // 🔥 모바일 select 초기화 함수 추가
  const initMobileSelect = () => {
    const selectList = document.getElementById("selectList")
    const isMobile = window.innerWidth <= 769

    if (!isMobile || !selectList) return

    console.log("모바일 select 초기화 시작")

    // 초기 선택된 텍스트 설정
    const selectedButton = selectList.querySelector("button.selected")
    const selectedText = selectedButton ? selectedButton.textContent : "옵션을 선택하세요"
    selectList.setAttribute("data-selected-text", selectedText)

    // 드롭다운 컨테이너 생성
    if (!selectList.querySelector(".mobile-dropdown")) {
      const dropdown = document.createElement("div")
      dropdown.className = "mobile-dropdown"

      // 모든 버튼을 드롭다운으로 이동
      const buttons = Array.from(selectList.querySelectorAll("button"))
      buttons.forEach((button) => {
        const clonedButton = button.cloneNode(true)
        // 🔥 클론된 버튼에도 이벤트 리스너 추가
        clonedButton.addEventListener("click", handleSelectButtonClick)
        dropdown.appendChild(clonedButton)
      })

      selectList.appendChild(dropdown)
    }

    // 오버레이 생성
    let overlay = document.querySelector(".mobile-select-overlay")
    if (!overlay) {
      overlay = document.createElement("div")
      overlay.className = "mobile-select-overlay"
      document.body.appendChild(overlay)
    }

    // 🔥 기존 이벤트 리스너 제거 후 새로 추가
    selectList.removeEventListener("click", handleMobileSelectClick)
    selectList.addEventListener("click", handleMobileSelectClick)

    overlay.removeEventListener("click", handleOverlayClick)
    overlay.addEventListener("click", handleOverlayClick)

    console.log("모바일 select 초기화 완료")
  }

  // 🔥 모바일 select 클릭 핸들러
  const handleMobileSelectClick = (e) => {
    const selectList = document.getElementById("selectList")
    const overlay = document.querySelector(".mobile-select-overlay")

    if (e.target === selectList || e.target.closest("::before")) {
      selectList.classList.toggle("active")
      overlay.classList.toggle("active")
    }

    // 드롭다운 버튼 클릭 처리
    if (e.target.tagName === "BUTTON" && e.target.closest(".mobile-dropdown")) {
      // 선택 상태 업데이트 (원본 버튼들과 드롭다운 버튼들 모두)
      selectList.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"))

      const buttonId = e.target.getAttribute("data-id")

      // 원본 버튼에도 selected 클래스 추가
      const originalButton = selectList.querySelector(`button[data-id="${buttonId}"]:not(.mobile-dropdown button)`)
      if (originalButton) {
        originalButton.classList.add("selected")
      }
      e.target.classList.add("selected")

      // 선택된 텍스트 업데이트
      selectList.setAttribute("data-selected-text", e.target.textContent)

      // 드롭다운 닫기
      selectList.classList.remove("active")
      overlay.classList.remove("active")

      // 🔥 기존 선택 로직 실행
      handleSelectButtonClick(e)
    }
  }

  // 🔥 오버레이 클릭 핸들러
  const handleOverlayClick = () => {
    const selectList = document.getElementById("selectList")
    const overlay = document.querySelector(".mobile-select-overlay")

    selectList.classList.remove("active")
    overlay.classList.remove("active")
  }

  // 선택 버튼 클릭 핸들러 (내부 함수로 정의) - 단일 선택만 가능하도록
  const handleSelectButtonClick = (e) => {
    const button = e.currentTarget
    const selectListBox = document.getElementById("selectList")
    const selectListLabel = document.getElementById("selectListLabel")

    // 이미 선택된 버튼인지 확인
    const isAlreadySelected = button.classList.contains("selected")

    // 모든 버튼에서 선택 클래스 제거 (원본 + 드롭다운)
    if (selectListBox) {
      selectListBox.querySelectorAll("button").forEach((btn) => {
        btn.classList.remove("selected")
      })
    }

    // 클릭한 버튼이 이미 선택된 상태가 아니었을 때만 선택 클래스 추가
    if (!isAlreadySelected) {
      button.classList.add("selected")

      // 🔥 모바일에서 드롭다운 버튼 클릭 시 원본 버튼도 선택 상태로 만들기
      const buttonId = button.getAttribute("data-id")
      if (buttonId) {
        const allButtons = selectListBox.querySelectorAll(`button[data-id="${buttonId}"]`)
        allButtons.forEach((btn) => btn.classList.add("selected"))

        // 🔥 모바일 select 텍스트 업데이트
        if (window.innerWidth <= 769) {
          selectListBox.setAttribute("data-selected-text", button.textContent)
        }
      }

      selectListBox.classList.remove("error")
      selectListLabel.classList.remove("error")
    }

    // 현재 편집 중인 작업 ID 가져오기
    const taskForm = document.getElementById("taskForm")
    const editingTaskId = taskForm ? taskForm.dataset.editId : null

    if (editingTaskId) {
      // 로컬 스토리지에서 작업 데이터 가져오기
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
      const taskIndex = tasks.findIndex((t) => t.id === editingTaskId)

      if (taskIndex !== -1) {
        // 선택된 버튼 정보 업데이트 (단일 선택)
        const selectedButton = selectListBox ? selectListBox.querySelector("button.selected") : null
        if (selectedButton) {
          // 버튼의 텍스트 및 ID 값 저장
          tasks[taskIndex].selectedButton = selectedButton.textContent
          tasks[taskIndex].buttonId = selectedButton.getAttribute("data-id")
          tasks[taskIndex].buttonComment = selectedButton.getAttribute("data-comment")
          tasks[taskIndex].buttonTitle = selectedButton.textContent

          console.log("버튼 선택 저장:", {
            text: selectedButton.textContent,
            id: selectedButton.getAttribute("data-id"),
            comment: selectedButton.getAttribute("data-comment"),
          })
        } else {
          // 선택된 버튼이 없는 경우 null로 설정
          tasks[taskIndex].selectedButton = null
          tasks[taskIndex].buttonId = null
          tasks[taskIndex].buttonTitle = null
        }

        // 로컬 스토리지에 저장
        localStorage.setItem("tasks", JSON.stringify(tasks))

        // 디버깅: 저장 후 로컬 스토리지 확인
        const updatedTasks = JSON.parse(localStorage.getItem("tasks"))
        console.log("로컬 스토리지 업데이트 후:", updatedTasks[taskIndex])
      }
    }
  }

  // 선택 목록 버튼 이벤트 리스너 설정 (내부 함수로 정의)
  const setupSelectListButtonEvents = () => {
    const selectListBox = document.getElementById("selectList")
    if (!selectListBox) return

    // 기존 이벤트 리스너 제거 (중복 방지)
    const buttons = selectListBox.querySelectorAll("button")
    buttons.forEach((btn) => {
      // 이벤트 리스너 제거 및 추가
      btn.removeEventListener("click", handleSelectButtonClick)
      btn.addEventListener("click", handleSelectButtonClick)
    })

    // 🔥 모바일 select 초기화 추가
    setTimeout(() => {
      initMobileSelect()
    }, 100)

    console.log("버튼 이벤트 리스너 설정 완료:", buttons.length)
  }

  // selectList 업데이트 함수 (중복 코드 제거를 위해 분리)
  const updateSelectList = (listData) => {
    const selectListBox = document.getElementById("selectList")
    if (!selectListBox) {
      console.warn("selectList 요소를 찾을 수 없습니다")
      return
    }

    // 데이터가 없는 경우 처리
    if (!listData || listData.length === 0) {
      selectListBox.innerHTML = "<p>검색 결과가 없습니다.</p>"
      return
    }

    // 🔥 기존 모바일 드롭다운 제거
    const existingDropdown = selectListBox.querySelector(".mobile-dropdown")
    if (existingDropdown) {
      existingDropdown.remove()
    }

    // 버튼 HTML 생성
    const selectListHTML = listData
      .map(
        (option) =>
          `<button type="button" data-id="${option.id}" data-comment="${option.comment || ""}">${option.name}</button>`,
      )
      .join("")

    // HTML 적용
    selectListBox.innerHTML = selectListHTML

    // 버튼 이벤트 리스너 다시 설정 (모바일 select 포함)
    setupSelectListButtonEvents()

    // 현재 편집 중인 작업의 선택된 버튼 복원 (필요한 경우)
    restoreSelectedButton()

    console.log("selectList 업데이트 완료")
  }

  // 선택된 버튼 복원 함수
  const restoreSelectedButton = () => {
    const taskForm = document.getElementById("taskForm")
    const editingTaskId = taskForm ? taskForm.dataset.editId : null

    if (!editingTaskId) return

    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    const taskIndex = tasks.findIndex((t) => t.id === editingTaskId)

    if (taskIndex === -1) return

    const task = tasks[taskIndex]
    if (!task.buttonId) return

    const selectListBox = document.getElementById("selectList")
    if (!selectListBox) return

    const buttons = selectListBox.querySelectorAll("button")
    buttons.forEach((btn) => {
      btn.classList.remove("selected")
      if (btn.getAttribute("data-id") === task.buttonId) {
        btn.classList.add("selected")

        // 🔥 모바일 select 텍스트도 업데이트
        if (window.innerWidth <= 769) {
          selectListBox.setAttribute("data-selected-text", btn.textContent)
        }

        console.log("버튼 선택 복원:", {
          text: btn.textContent,
          id: btn.getAttribute("data-id"),
          comment: btn.getAttribute("data-comment"),
        })
      }
    })
  }

  // 🔥 리사이즈 이벤트 리스너 추가
  const setupResizeListener = () => {
    let resizeTimer
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        initMobileSelect()
      }, 250)
    })
  }

  // 초기화 함수 수정
  const init = () => {
    // 🔥 리사이즈 리스너 설정
    setupResizeListener()

    // 초기 선택된 버튼이 없으면 첫 번째 버튼 선택
    if (!initialButton && chartTypeButton.length > 0) {
      initialButton = chartTypeButton[0]
      initialButton.classList.add("--active")
      chartTypeValue = initialButton.getAttribute("data-chart-type")

      // 차트 타입 입력 필드 초기화
      const chartTypeInput = document.getElementById("chartType")
      if (chartTypeInput) {
        chartTypeInput.value = chartTypeValue
      }

      // 초기 템플릿 설정
      updateUIByChartType(chartTypeValue, initialButton)
    } else if (initialButton) {
      // 이미 선택된 버튼이 있는 경우 해당 템플릿 설정
      chartTypeValue = initialButton.getAttribute("data-chart-type")
      updateUIByChartType(chartTypeValue, initialButton)
    }

    // ... 나머지 초기화 코드 동일 ...
  }

  // 초기화 실행
  init()

  // 메서드 반환
  return {
    getSelectedChartType,
    setChartType,
    getSelectList,
    getChartOptionsData,
    getSelectedButton,
    prepareChartData,
    resetSelectList: () => {
      // selectList 버튼 초기화
      const selectListBox = document.getElementById("selectList")
      if (selectListBox) {
        const buttons = selectListBox.querySelectorAll("button")
        buttons.forEach((btn) => {
          btn.classList.remove("selected")
        })

        // 🔥 모바일 select 텍스트도 초기화
        if (window.innerWidth <= 769) {
          selectListBox.setAttribute("data-selected-text", "옵션을 선택하세요")
        }
      }
    },
    // ... 나머지 메서드들 동일 ...
  }
}

export default ChartConfigManager
