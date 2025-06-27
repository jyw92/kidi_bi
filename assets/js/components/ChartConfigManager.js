import { fetchData } from "./fetchData.js"
import createInsuranceSelector from "./insuranceSelector/insuaranceSelector.js"

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
  let chartOptionsData = {} // 차트 옵션 데이터 저장 객체

  //  모바일 select 초기화 함수
  const initMobileSelect = () => {
    const selectListElement = document.getElementById("selectList")
    const isMobile = window.innerWidth <= 769

    if (!isMobile || !selectListElement) return

    console.log("모바일 select 초기화 시작")

    // 초기 선택된 텍스트 설정
    const selectedButton = selectListElement.querySelector("button.selected")
    const selectedText = selectedButton ? selectedButton.textContent : "옵션을 선택하세요"
    selectListElement.setAttribute("data-selected-text", selectedText)

    // 기존 드롭다운 제거 (중복 방지)
    const existingDropdown = selectListElement.querySelector(".mobile-dropdown")
    if (existingDropdown) {
      existingDropdown.remove()
    }

    // 드롭다운 컨테이너 생성
    const dropdown = document.createElement("div")
    dropdown.className = "mobile-dropdown"

    // 모든 버튼을 드롭다운으로 복사
    const buttons = Array.from(selectListElement.querySelectorAll("button"))
    buttons.forEach((button) => {
      const clonedButton = button.cloneNode(true)
      //  복사된 버튼에 이벤트 리스너 추가
      clonedButton.addEventListener("click", handleMobileDropdownClick)
      dropdown.appendChild(clonedButton)
    })

    selectListElement.appendChild(dropdown)

    // 오버레이 생성
    let overlay = document.querySelector(".mobile-select-overlay")
    if (!overlay) {
      overlay = document.createElement("div")
      overlay.className = "mobile-select-overlay"
      document.body.appendChild(overlay)
    }

    //  기존 이벤트 리스너 제거 후 새로 추가 (중복 방지)
    selectListElement.removeEventListener("click", handleMobileSelectClick)
    selectListElement.addEventListener("click", handleMobileSelectClick)

    overlay.removeEventListener("click", handleOverlayClick)
    overlay.addEventListener("click", handleOverlayClick)

    console.log("모바일 select 초기화 완료")
  }

  //  모바일 select 클릭 핸들러
  const handleMobileSelectClick = (e) => {
    const selectListElement = document.getElementById("selectList")
    const overlay = document.querySelector(".mobile-select-overlay")

    // select 박스 자체 클릭 시 드롭다운 토글
    if (e.target === selectListElement) {
      selectListElement.classList.toggle("active")
      overlay.classList.toggle("active")
      e.stopPropagation()
    }
  }

  //  모바일 드롭다운 버튼 클릭 핸들러
  const handleMobileDropdownClick = (e) => {
    const selectListElement = document.getElementById("selectList")
    const overlay = document.querySelector(".mobile-select-overlay")

    if (e.target.tagName === "BUTTON") {
      const buttonId = e.target.getAttribute("data-id")

      // 🔧 모든 버튼에서 selected 클래스 제거 (원본 + 드롭다운 모두)
      selectListElement.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"))

      // 🔧 같은 data-id를 가진 모든 버튼에 selected 클래스 추가 (원본 + 드롭다운 모두)
      const allMatchingButtons = selectListElement.querySelectorAll(`button[data-id="${buttonId}"]`)
      allMatchingButtons.forEach((btn) => {
        btn.classList.add("selected")
        console.log("Selected 클래스 추가됨:", btn.textContent, btn.classList.contains("mobile-dropdown"))
      })

      // 🔧 선택된 텍스트 업데이트
      selectListElement.setAttribute("data-selected-text", e.target.textContent)

      // 🔧 error 클래스 제거 (있다면)
      const selectListLabel = document.getElementById("selectListLabel")
      if (selectListElement) {
        selectListElement.classList.remove("error")
      }
      if (selectListLabel) {
        selectListLabel.classList.remove("error")
      }

      // 드롭다운 닫기
      selectListElement.classList.remove("active")
      overlay.classList.remove("active")

      // 🔧 원본 버튼 찾기 및 선택 로직 실행
      const originalButton = selectListElement.querySelector(
        `button[data-id="${buttonId}"]:not(.mobile-dropdown button)`,
      )

      if (originalButton) {
        console.log("원본 버튼 찾음:", originalButton.textContent)
        // 가짜 이벤트 객체 생성하여 기존 선택 로직 실행
        const fakeEvent = { currentTarget: originalButton }
        handleSelectButtonClick(fakeEvent)
      } else {
        console.warn("원본 버튼을 찾을 수 없습니다:", buttonId)
      }

      e.stopPropagation()
    }
  }

  //  오버레이 클릭 핸들러
  const handleOverlayClick = () => {
    const selectListElement = document.getElementById("selectList")
    const overlay = document.querySelector(".mobile-select-overlay")

    selectListElement.classList.remove("active")
    overlay.classList.remove("active")
  }

  // 선택 버튼 클릭 핸들러 (내부 함수로 정의) - 단일 선택만 가능하도록
  const handleSelectButtonClick = (e) => {
    const button = e.currentTarget;
    const selectListBox = document.getElementById("selectList");
    const selectListLabel = document.getElementById("selectListLabel");

    // 이미 선택된 버튼인지 확인
    const isAlreadySelected = button.classList.contains("selected");
    const buttonId = button.getAttribute("data-id");

    // 모든 버튼에서 선택 클래스 제거
    if (selectListBox) {
      selectListBox.querySelectorAll("button").forEach((btn) => {
        btn.classList.remove("selected");
      });
    }

    // 클릭한 버튼이 이미 선택된 상태가 아니었거나, 모바일에서 클릭된 경우 항상 선택 상태로 만듦
    if (!isAlreadySelected || window.innerWidth <= 769) {
        
      // data-id를 가진 모든 관련 버튼에 selected 클래스 추가
      if (buttonId && selectListBox) {
        const allMatchingButtons = selectListBox.querySelectorAll(`button[data-id="${buttonId}"]`);
        allMatchingButtons.forEach((btn) => btn.classList.add("selected"));

        // 모바일 select 텍스트 업데이트
        if (window.innerWidth <= 769) {
          selectListBox.setAttribute("data-selected-text", button.textContent);
        }
      } else {
        // data-id가 없는 경우 (혹은 예외상황)를 대비해 현재 버튼만이라도 선택
        button.classList.add("selected");
      }
      
      if(selectListBox) selectListBox.classList.remove("error");
      if(selectListLabel) selectListLabel.classList.remove("error");
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
    const buttons = selectListBox.querySelectorAll("button:not(.mobile-dropdown button)")
    buttons.forEach((btn) => {
      // 이벤트 리스너 제거 및 추가
      btn.removeEventListener("click", handleSelectButtonClick)
      btn.addEventListener("click", handleSelectButtonClick)
    })

    //  모바일 select 초기화 (약간의 지연 후)
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

    //  기존 모바일 드롭다운과 오버레이 제거
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

        //  모바일 select 텍스트도 업데이트
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

  //  리사이즈 이벤트 리스너 설정
  const setupResizeListener = () => {
    let resizeTimer
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        initMobileSelect()
      }, 250)
    })
  }

  // 구분 타입 변경 이벤트 설정 함수
  const setupGubunTypeChangeEvent = () => {
    const gubunType = document.getElementById("gubunType")
    if (!gubunType) {
      console.warn("gubunType 요소를 찾을 수 없습니다")
      return
    }

    // 이벤트 리스너 추가
    gubunType.addEventListener("change", async function () {
      try {
        // 선택된 값 가져오기
        const selectedValue = this.value
        console.log("gubunType 변경:", selectedValue)

        // 현재 선택된 옵션 데이터 업데이트
        if (chartOptionsData) {
          chartOptionsData.selectedGubunType = selectedValue

          // 현재 편집 중인 작업 ID 가져오기
          const taskForm = document.getElementById("taskForm")
          const editingTaskId = taskForm ? taskForm.dataset.editId : null

          if (editingTaskId) {
            // 로컬 스토리지에서 작업 데이터 가져오기
            const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
            const taskIndex = tasks.findIndex((t) => t.id === editingTaskId)

            if (taskIndex !== -1) {
              // 작업에 차트 옵션 데이터 업데이트
              tasks[taskIndex].chartOptionsData = chartOptionsData

              // 로컬 스토리지에 저장
              localStorage.setItem("tasks", JSON.stringify(tasks))
              console.log("작업 데이터 업데이트됨:", tasks[taskIndex])
            }
          }
        }

        // API 호출하여 데이터 가져오기 (선택된 값을 파라미터로 전달)
        const listData = await fetchData(`http://localhost:3000/list?gubunType=${selectedValue}`)
        console.log("리스트 데이터 로드:", listData)

        // selectList 업데이트
        updateSelectList(listData)
      } catch (error) {
        console.error("gubunType 변경 처리 중 오류:", error)
      }
    })

    console.log("gubunType 변경 이벤트 설정 완료")
  }

  // 검색 기능 설정 함수
  const setupSearchFunction = () => {
    const searchInput = document.getElementById("listSearch")
    if (!searchInput) {
      console.warn("검색 입력 필드를 찾을 수 없습니다")
      return
    }

    // 검색 버튼 찾기 - 정확한 선택자 사용
    const searchButton = document.querySelector(".column--item .row--item .dialog--search")
    if (!searchButton) {
      console.warn("검색 버튼을 찾을 수 없습니다")
      return
    }

    // 검색 버튼 클릭 이벤트 리스너
    searchButton.addEventListener("click", performSearch)
    console.log("검색 버튼 이벤트 리스너 설정 완료")

    // 엔터 키 이벤트 리스너
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault() // 폼 제출 방지
        performSearch()
      }
    })
    console.log("검색 입력 필드 이벤트 리스너 설정 완료")
  }

  // 검색 실행 함수
  const performSearch = async () => {
    try {
      const searchInput = document.getElementById("listSearch")
      const searchTerm = searchInput ? searchInput.value.trim() : ""

      console.log("검색 실행:", searchTerm)

      // 검색어가 비어있는 경우 기본 목록 로드
      if (!searchTerm) {
        const listData = await fetchData("http://localhost:3000/list")
        updateSelectList(listData)
        return
      }

      // 검색어가 있는 경우 검색 파라미터 추가하여 API 호출
      const listData = await fetchData(`http://localhost:3000/list?search=${encodeURIComponent(searchTerm)}`)
      console.log("검색 결과:", listData)

      // 결과로 selectList 업데이트
      updateSelectList(listData)
    } catch (error) {
      console.error("검색 처리 중 오류:", error)
    }
  }

  // 템플릿 함수들
  const template01 = () => {
    return /* html */ `
      <div class="form-group row">
          <div class="column--item">
          <label for="">구분</label>
          <select id="gubunType">
              <option value="">전체</option>
              <option value="">테스트</option>
          </select>
          </div>
          <div class="column--item">
          <label for="">검색</label>
          <div class="row--item search--area">
              <input type="search" id="listSearch">
              <button type="button" id="dialog--search">검색</button>
          </div>
          </div>
      </div>
      <div class="form-group">
          <label for="selectList" id="selectListLabel">리스트</label>
          <div id="selectList"></div>
      </div>
    `
  }

  // 2025.05.26 아래추가
  const template02 = () => {
    return /* html */ `
      <div style="display:flex;gap:10px;min-height:350px;">
      <!-- 보험 종목 트리 섹션 -->
      <div class="form-section insurance-tree-section" style="flex:1">
          <div class="tree-container">
              <h3 class="tree-title">🛡️ 보험 종목 선택</h3>
              <div id="insurance-tree"></div>
          </div>
      </div>
      <!-- 분류 선택 섹션 -->
      <div class="form-section" style="flex:2">
            <div class="form-group">
                <label for="classificationType" class="form-label">📊 분류 선택</label>
                <select id="classificationType" class="form-select">
                    <option value="">분류를 선택하세요</option>
                    <option value="yearly">년도별 조회</option>
                    <option value="monthly">월별 조회</option>
                    <option value="quarterly">분기별 조회</option>
                </select>
            </div>

            <!-- 자료년월 선택 -->
            <div class="form-group">
                <label class="form-label">📅 자료년월 (범위 선택)</label>
                <div class="date-selector">
                    <!-- 년도 범위 선택 (모든 분류에서 공통) -->
                    <div id="yearGroup" class="date-group">
                        <label class="form-label">년도 범위</label>
                        <div class="range-group">
                            <select id="yearFromSelect" class="form-select">
                                <option value="">시작 년도</option>
                            </select>
                            <select id="yearToSelect" class="form-select">
                                <option value="">종료 년도</option>
                            </select>
                        </div>
                    </div>

                    <!-- 월 범위 선택 (월별 조회 시에만) -->
                    <div id="monthGroup" class="date-group">
                        <label class="form-label">월 범위</label>
                        <div class="range-group">
                            <select id="monthFromSelect" class="form-select">
                                <option value="">시작 월</option>
                                <option value="01">1월</option>
                                <option value="02">2월</option>
                                <option value="03">3월</option>
                                <option value="04">4월</option>
                                <option value="05">5월</option>
                                <option value="06">6월</option>
                                <option value="07">7월</option>
                                <option value="08">8월</option>
                                <option value="09">9월</option>
                                <option value="10">10월</option>
                                <option value="11">11월</option>
                                <option value="12">12월</option>
                            </select>
                            <select id="monthToSelect" class="form-select">
                                <option value="">종료 월</option>
                                <option value="01">1월</option>
                                <option value="02">2월</option>
                                <option value="03">3월</option>
                                <option value="04">4월</option>
                                <option value="05">5월</option>
                                <option value="06">6월</option>
                                <option value="07">7월</option>
                                <option value="08">8월</option>
                                <option value="09">9월</option>
                                <option value="10">10월</option>
                                <option value="11">11월</option>
                                <option value="12">12월</option>
                            </select>
                        </div>
                    </div>

                    <!-- 분기 범위 선택 (분기별 조회 시에만) -->
                    <div id="quarterGroup" class="date-group">
                        <label class="form-label">분기 범위</label>
                        <div class="range-group row">
                            <select id="quarterFromSelect" class="form-select">
                                <option value="">시작 분기</option>
                                <option value="Q1">1분기 (1-3월)</option>
                                <option value="Q2">2분기 (4-6월)</option>
                                <option value="Q3">3분기 (7-9월)</option>
                                <option value="Q4">4분기 (10-12월)</option>
                            </select>
                            <select id="quarterToSelect" class="form-select">
                                <option value="">종료 분기</option>
                                <option value="Q1">1분기 (1-3월)</option>
                                <option value="Q2">2분기 (4-6월)</option>
                                <option value="Q3">3분기 (7-9월)</option>
                                <option value="Q4">4분기 (10-12월)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
        

        <!-- 결과 표시 섹션 -->
        <div class="result-section">
            <h3 class="result-title">📋 선택 결과</h3>
            <div id="result" class="result-content">
                분류와 보험 종목을 선택하면 결과가 여기에 표시됩니다.
            </div>
        </div>
    `
  }

  // 템플릿 선택 함수
  const getTemplateByChartType = (chartType) => {
    if (chartType === "chart-1" || chartType === "chart-2") {
      return template01()
    } else if (chartType === "chart-3") {
      return template02()
    }
    // 기본값으로 template01 반환
    return template01()
  }

  // 차트 타입에 따른 UI 업데이트 함수
  const updateUIByChartType = async (dataChartType, target) => {
    // 템플릿 선택 및 적용
    const templateContent = getTemplateByChartType(dataChartType)

    const formGroupWrapper = document.querySelector(".form-group--wrapper")

    if (formGroupWrapper) {
      formGroupWrapper.innerHTML = templateContent
      if (dataChartType === "chart-3") {
        formGroupWrapper.style.height = "537px"
        formGroupWrapper.style.overflowY = "auto"

        // 보험 선택기 초기화를 지연시켜 DOM이 완전히 렌더링된 후 실행
        setTimeout(() => {
          try {
            console.log("보험 선택기 초기화 시작...")

            // 기존 인스턴스가 있으면 정리
            if (window.insuranceSelector) {
              console.log("기존 보험 선택기 인스턴스 정리")
              window.insuranceSelector = null
            }

            // 새 인스턴스 생성
            window.insuranceSelector = createInsuranceSelector("insurance-tree", true)

            if (window.insuranceSelector) {
              console.log("보험 선택기 초기화 완료")
            } else {
              console.error("보험 선택기 초기화 실패")
            }
          } catch (error) {
            console.error("보험 선택기 초기화 중 오류:", error)
          }
        }, 100)
      }
    } else {
      console.warn("form-group--wrapper element not found")
      return
    }

    // 차트 타입 값 업데이트
    chartTypeValue = dataChartType

    // 차트 타입 입력 필드 업데이트 (있는 경우)
    const chartTypeInput = document.getElementById("chartType")
    if (chartTypeInput) {
      chartTypeInput.value = chartTypeValue

      // 변경 이벤트 발생시키기 (필요한 경우)
      const event = new Event("change", { bubbles: true })
      chartTypeInput.dispatchEvent(event)
    }

    // chart-1 또는 chart-2인 경우에만 template01 관련 로직 실행
    if (dataChartType === "chart-1" || dataChartType === "chart-2") {
      try {
        const data = await fetchData(`http://localhost:3000/chart`)
        const listData = await fetchData("http://localhost:3000/list")
        const gubunType = document.getElementById("gubunType")
        const taskTitle = document.getElementById("taskTitle")
        const selectListBox = document.getElementById("selectList")

        if (gubunType && selectListBox && taskTitle) {
          gubunType.innerHTML = ""
          selectListBox.innerHTML = ""
          taskTitle.value = target.textContent.trim()

          selectList = data[dataChartType]
          const optionsHTML = data[dataChartType]
            .map((option, index) => `<option value="0${index}">${option.name}</option>`)
            .join("")
          const selectListHTML = listData
            .map(
              (option) =>
                `<button type="button" data-id="${option.id}" data-comment="${option.comment}">${option.name}</button>`,
            )
            .join("")

          gubunType.innerHTML = optionsHTML
          selectListBox.innerHTML = selectListHTML

          // 현재 선택된 옵션 데이터 저장
          const selectedGubunType = gubunType.value

          // 차트 옵션 데이터 저장
          chartOptionsData = {
            chartType: dataChartType,
            selectList: selectList,
            selectedGubunType: selectedGubunType,
            listData: listData,
          }

          // 새로운 버튼이 생성되었으므로 이벤트 리스너 다시 설정
          setupSelectListButtonEvents()
          setupGubunTypeChangeEvent()
          setupSearchFunction() // 검색 기능 설정 추가

          // 현재 편집 중인 작업 ID 가져오기
          const taskForm = document.getElementById("taskForm")
          const editingTaskId = taskForm ? taskForm.dataset.editId : null

          // 편집 모드인 경우에만 선택된 버튼 복원
          if (editingTaskId) {
            restoreSelectedButton()
          }
        }
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error)
      }
    } else if (dataChartType === "chart-3") {
      // chart-3인 경우 template02 관련 로직
      const taskTitle = document.getElementById("taskTitle")
      if (taskTitle) {
        taskTitle.value = target.textContent.trim()
      }

      // chart-3 전용 데이터 저장
      chartOptionsData = {
        chartType: dataChartType,
      }
    }

    // 현재 편집 중인 작업 ID 가져오기
    const taskForm = document.getElementById("taskForm")
    const editingTaskId = taskForm ? taskForm.dataset.editId : null

    if (editingTaskId) {
      // 로컬 스토리지에서 작업 데이터 가져오기
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
      const taskIndex = tasks.findIndex((t) => t.id === editingTaskId)

      if (taskIndex !== -1) {
        // 작업에 차트 옵션 데이터 추가
        tasks[taskIndex].chartOptionsData = chartOptionsData

        // 로컬 스토리지에 저장
        localStorage.setItem("tasks", JSON.stringify(tasks))
      }
    }
  }

  // 이벤트 리스너 설정
  chartTypeButton.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const target = e.currentTarget
      const dataChartType = target.getAttribute("data-chart-type")

      // 모든 버튼에서 활성 클래스 제거
      chartTypeButton.forEach((button) => button.classList.remove("--active"))

      // 클릭된 버튼에 활성 클래스 추가
      target.classList.add("--active")

      // 차트 타입에 따른 UI 업데이트
      await updateUIByChartType(dataChartType, target)
    })
  })

  // 현재 선택된 차트 타입 반환 함수
  const getSelectedChartType = () => chartTypeValue

  // 선택 목록 반환 함수
  const getSelectList = () => selectList

  // 차트 옵션 데이터 반환 함수
  const getChartOptionsData = () => chartOptionsData

  // 선택된 버튼 정보 반환 함수
  const getSelectedButton = () => {
    // chart-1 또는 chart-2인 경우에만 선택된 버튼 반환
    if (chartTypeValue === "chart-1" || chartTypeValue === "chart-2") {
      const selectListBox = document.getElementById("selectList")
      if (!selectListBox) return null

      const selectedButton = selectListBox.querySelector("button.selected:not(.mobile-dropdown button)")
      if (!selectedButton) return null

      // 현재 편집 중인 작업 ID 가져오기
      const taskForm = document.getElementById("taskForm")
      const editingTaskId = taskForm ? taskForm.dataset.editId : null

      if (editingTaskId) {
        // 로컬 스토리지에서 작업 데이터 가져오기
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
        const taskIndex = tasks.findIndex((t) => t.id === editingTaskId)

        if (taskIndex !== -1) {
          // 버튼 정보 업데이트
          tasks[taskIndex].buttonId = selectedButton.getAttribute("data-id")
          tasks[taskIndex].buttonTitle = selectedButton.textContent
          tasks[taskIndex].buttonComment = selectedButton.getAttribute("data-comment")
          localStorage.setItem("tasks", JSON.stringify(tasks))
        }
      }

      return {
        text: selectedButton.textContent,
        id: selectedButton.getAttribute("data-id"),
        comment: selectedButton.getAttribute("data-comment"),
        title: selectedButton.textContent,
      }
    }
    return null
  }

  // 차트 타입 설정 함수
  const setChartType = (type) => {
    if (!type) return

    const button = Array.from(chartTypeButton).find((btn) => btn.getAttribute("data-chart-type") === type)

    if (button) {
      chartTypeButton.forEach((btn) => btn.classList.remove("--active"))
      button.classList.add("--active")
      chartTypeValue = type

      // 차트 타입 입력 필드 업데이트
      const chartTypeInput = document.getElementById("chartType")
      if (chartTypeInput) {
        chartTypeInput.value = chartTypeValue
      }

      // 템플릿 업데이트
      updateUIByChartType(type, button)
    }
  }

  // 차트 데이터 준비 함수
  const prepareChartData = async () => {
    // 선택된 버튼 정보 가져오기
    const selectedButton = getSelectedButton()

    if (!selectedButton) {
      return null
    }

    try {
      // 차트 데이터 준비 로직
      const chartData = await fetchData(`http://localhost:3000/chartData/${selectedButton.id}`)

      return {
        buttonId: selectedButton.id,
        buttonTitle: selectedButton.title,
        chartType: chartTypeValue,
        data: chartData,
      }
    } catch (error) {
      console.error("차트 데이터 준비 중 오류 발생:", error)
      return null
    }
  }

  // 초기화 함수
  const init = () => {
    //  리사이즈 이벤트 리스너 설정
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

    // 현재 편집 중인 작업 ID 가져오기
    const taskForm = document.getElementById("taskForm")
    const editingTaskId = taskForm ? taskForm.dataset.editId : null

    if (editingTaskId) {
      // 로컬 스토리지에서 작업 데이터 가져오기
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
      const task = tasks.find((t) => t.id === editingTaskId)

      if (task) {
        // 저장된 차트 옵션 데이터 복원
        if (task.chartOptionsData) {
          chartOptionsData = task.chartOptionsData
          chartTypeValue = chartOptionsData.chartType
          selectList = chartOptionsData.selectList

          // 버튼 상태 복원
          chartTypeButton.forEach((btn) => {
            if (btn.getAttribute("data-chart-type") === chartTypeValue) {
              btn.classList.add("--active")
              // 해당 버튼에 맞는 템플릿 설정
              updateUIByChartType(chartTypeValue, btn)
            } else {
              btn.classList.remove("--active")
            }
          })
        }
      }
    }
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

        //  모바일 select 텍스트도 초기화
        if (window.innerWidth <= 769) {
          selectListBox.setAttribute("data-selected-text", "옵션을 선택하세요")
        }
      }
    },
    // 차트 데이터 저장 메서드
    saveChartData: (taskId, chartData) => {
      if (!taskId || !chartData) return false

      try {
        // 로컬 스토리지에서 작업 데이터 가져오기
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
        const taskIndex = tasks.findIndex((t) => t.id === taskId)

        if (taskIndex !== -1) {
          // 차트 데이터 저장
          tasks[taskIndex].chartData = chartData
          localStorage.setItem("tasks", JSON.stringify(tasks))
          return true
        }
        return false
      } catch (error) {
        console.error("차트 데이터 저장 중 오류 발생:", error)
        return false
      }
    },
    // 차트 데이터 로드 메서드
    loadChartData: (taskId) => {
      if (!taskId) return null

      try {
        // 로컬 스토리지에서 작업 데이터 가져오기
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
        const task = tasks.find((t) => t.id === taskId)

        if (task && task.chartData) {
          return task.chartData
        }
        return null
      } catch (error) {
        console.error("차트 데이터 로드 중 오류 발생:", error)
        return null
      }
    },
  }
}

export default ChartConfigManager
