// ==================== 보험 트리 데이터 ====================
const boheomJongmogData = [
  {
    id: "1",
    title: "생명보험",
    level: 1,
    children: [
      {
        id: "1-1",
        parentId: "1",
        title: "일반계정",
        level: 2,
        children: [
          { id: "1-1-1", parentId: "1-1", title: "보장성", level: 3, children: false },
          { id: "1-1-2", parentId: "1-1", title: "저축성", level: 3, children: false },
        ],
      },
      {
        id: "1-2",
        parentId: "1",
        title: "특별계정",
        level: 2,
        children: [
          { id: "1-2-1", parentId: "1-2", title: "보장성", level: 3, children: false },
          { id: "1-2-2", parentId: "1-2", title: "저축성", level: 3, children: false },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "손해보험",
    level: 1,
    children: [
      {
        id: "2-1",
        parentId: "2",
        title: "일반손해보험",
        level: 2,
        children: [
          { id: "2-1-1", parentId: "2-1", title: "화재보험", level: 3, children: false },
          { id: "2-1-2", parentId: "2-1", title: "자동차보험", level: 3, children: false },
        ],
      },
      {
        id: "2-2",
        parentId: "2",
        title: "장기손해보험",
        level: 2,
        children: [
          { id: "2-2-1", parentId: "2-2", title: "상해보험", level: 3, children: false },
          { id: "2-2-2", parentId: "2-2", title: "질병보험", level: 3, children: false },
        ],
      },
    ],
  },
]

// ==================== 팩토리 함수 ====================
function createInsuranceSelector(containerId = "insurance-tree", autoInit = false) {
  // 인스턴스별 상태 - 범위 선택으로 변경
  const state = {
    expandedNodes: new Set(),
    selectedNodes: new Map(),
    treeContainer: null,
    selectedType: "",
    // 범위 선택을 위한 상태 변경
    selectedYearFrom: "",
    selectedYearTo: "",
    selectedMonthFrom: "",
    selectedMonthTo: "",
    selectedQuarterFrom: "",
    selectedQuarterTo: "",
    containerId: containerId,
    initialized: false,
    // 차트 조합 관리를 위한 새로운 상태
    combinationChart: {
      chartType: "column", // 기본 차트 타입
    },
    // 상태 항목을 배열로 관리
    selectedStateItems: [],
  }

  // ==================== 트리 관련 함수들 ====================
  const totalCharts = 0 // Initialize totalCharts here to make it accessible globally

  function initializeTree() {
    state.treeContainer = document.getElementById(state.containerId)
    if (!state.treeContainer) {
      console.warn(`Container with id "${state.containerId}" not found. Tree initialization skipped.`)
      return false
    }

    setupTreeControls()
    renderTree()
    console.log("보험 트리 초기화 완료")
    return true
  }

  function setupTreeControls() {
    const selectAllBtn = document.getElementById("selectAllBtn")
    const deselectAllBtn = document.getElementById("deselectAllBtn")
    const expandAllBtn = document.getElementById("expandAllBtn")
    const collapseAllBtn = document.getElementById("collapseAllBtn")

    if (selectAllBtn) {
      selectAllBtn.addEventListener("click", selectAllNodes)
    }
    if (deselectAllBtn) {
      deselectAllBtn.addEventListener("click", deselectAllNodes)
    }
    if (expandAllBtn) {
      expandAllBtn.addEventListener("click", expandAllNodes)
    }
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener("click", collapseAllNodes)
    }
  }

  function handleNodeToggle(node, isCheckboxClick = false) {
    console.log("노드 토글:", node, "isCheckboxClick:", isCheckboxClick)

    if (isCheckboxClick) {
      toggleNodeSelection(node)
    } else {
      if (node.children && node.children !== false && node.children.length > 0) {
        if (state.expandedNodes.has(node.id)) {
          state.expandedNodes.delete(node.id)
        } else {
          state.expandedNodes.add(node.id)
        }
        renderTree()
      } else {
        toggleNodeSelection(node)
      }
    }
  }

  function toggleNodeSelection(node) {
    if (state.selectedNodes.has(node.id)) {
      state.selectedNodes.delete(node.id)
      console.log("노드 선택 해제:", node.title)
    } else {
      // 트리메뉴 최대 4개 제한
      if (state.selectedNodes.size >= 4) {
        alert("⚠️ 보험종목은 최대 4개까지 선택할 수 있습니다.")
        return
      }
      state.selectedNodes.set(node.id, node)
      console.log("노드 선택:", node.title)
    }

    updateTreeDisplay()
    updateResult()
    // 보험종목 선택/해제 시 API 호출
    checkAndFetchStateItems()
    // 차트 설정 업데이트
    updateChartSettingsVisibility()
  }

  function removeSelectedNode(nodeId) {
    state.selectedNodes.delete(nodeId)
    updateTreeDisplay()
    updateResult()
    // 보험종목 제거 시 API 호출
    checkAndFetchStateItems()
    // 차트 설정도 업데이트 (해당 노드와 관련된 모든 차트 제거됨)
    updateChartSettingsVisibility()
  }

  function selectAllNodes() {
    const allNodes = getAllLeafNodes(boheomJongmogData)
    // 최대 4개까지만 선택
    const nodesToSelect = allNodes.slice(0, 4)

    state.selectedNodes.clear()
    nodesToSelect.forEach((node) => {
      state.selectedNodes.set(node.id, node)
    })

    updateTreeDisplay()
    updateResult()
    checkAndFetchStateItems()

    if (allNodes.length > 4) {
      alert(`⚠️ 보험종목은 최대 4개까지 선택할 수 있어 처음 4개만 선택되었습니다.`)
    }

    console.log("전체 노드 선택됨:", state.selectedNodes.size)
  }

  function deselectAllNodes() {
    state.selectedNodes.clear()
    updateTreeDisplay()
    updateResult()
    // 전체 해제 시 API 호출
    checkAndFetchStateItems()
    console.log("전체 노드 선택 해제됨")
  }

  function expandAllNodes() {
    const allParentNodes = getAllParentNodes(boheomJongmogData)
    allParentNodes.forEach((node) => {
      state.expandedNodes.add(node.id)
    })
    renderTree()
    console.log("전체 노드 펼쳐짐")
  }

  function collapseAllNodes() {
    state.expandedNodes.clear()
    renderTree()
    console.log("전체 노드 접혀짐")
  }

  function getAllLeafNodes(nodes) {
    const leafNodes = []

    function traverse(nodeList) {
      nodeList.forEach((node) => {
        if (!node.children || node.children === false || node.children.length === 0) {
          leafNodes.push(node)
        } else {
          traverse(node.children)
        }
      })
    }

    traverse(nodes)
    return leafNodes
  }

  function getAllParentNodes(nodes) {
    const parentNodes = []

    function traverse(nodeList) {
      nodeList.forEach((node) => {
        if (node.children && node.children !== false && node.children.length > 0) {
          parentNodes.push(node)
          traverse(node.children)
        }
      })
    }

    traverse(nodes)
    return parentNodes
  }

  function getNodePath(nodeId) {
    const findPath = (nodes, targetId, currentPath = []) => {
      for (const node of nodes) {
        const newPath = [...currentPath, node]
        if (node.id === targetId) {
          return newPath
        }
        if (node.children && node.children !== false) {
          const result = findPath(node.children, targetId, newPath)
          if (result) return result
        }
      }
      return null
    }

    return findPath(boheomJongmogData, nodeId)
  }

  function renderTreeNode(node) {
    const nodeElement = document.createElement("div")
    nodeElement.className = "tree-node"

    const itemElement = document.createElement("div")
    const isExpanded = state.expandedNodes.has(node.id)
    const hasChildren = node.children && node.children !== false && node.children.length > 0
    const isSelected = state.selectedNodes.has(node.id)

    itemElement.className = `tree-item level-${node.level}`
    if (isSelected) {
      itemElement.classList.add("selected")
    }
    itemElement.setAttribute("data-node-id", node.id)

    // 체크박스 추가
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.className = "tree-checkbox"
    checkbox.checked = isSelected
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation()
      handleNodeToggle(node, true)
    })
    itemElement.appendChild(checkbox)

    // 확장/축소 아이콘
    if (hasChildren) {
      const chevron = document.createElement("div")
      chevron.className = `chevron ${isExpanded ? "rotated" : ""}`
      chevron.innerHTML = `<svg viewBox="0 0 24 24" stroke="currentColor" fill="none"><polyline points="9,18 15,12 9,6"/></svg>`
      itemElement.appendChild(chevron)
    } else {
      const placeholder = document.createElement("div")
      placeholder.className = "chevron-placeholder"
      itemElement.appendChild(placeholder)
    }

    // 아이콘
    const icon = document.createElement("div")
    icon.className = "icon"
    if (node.level === 1) {
      // 방패 아이콘 - 경로를 완전한 형태로 수정
      icon.innerHTML = `<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    } else if (node.level === 2) {
      // 폴더 아이콘 - 경로를 완전한 형태로 수정
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/></svg>`
    } else {
      // 문서 아이콘 - 경로를 완전한 형태로 수정
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/><polyline points="14,2 14,8 20,8" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
    }
    itemElement.appendChild(icon)

    // 제목
    const titleElement = document.createElement("span")
    titleElement.className = "tree-item-title"
    titleElement.textContent = node.title
    itemElement.appendChild(titleElement)

    // 제목 및 아이템 전체 클릭 이벤트
    itemElement.addEventListener("click", (e) => {
      e.stopPropagation()
      handleNodeToggle(node, false)
    })

    nodeElement.appendChild(itemElement)

    // 자식 노드 렌더링
    if (isExpanded && hasChildren) {
      const childrenContainer = document.createElement("div")
      childrenContainer.className = "tree-children"

      node.children.forEach((childNode) => {
        const childElement = renderTreeNode(childNode)
        childrenContainer.appendChild(childElement)
      })

      nodeElement.appendChild(childrenContainer)
    }

    return nodeElement
  }

  function renderTree() {
    if (!state.treeContainer) return

    const treeContent = document.createElement("div")

    boheomJongmogData.forEach((node) => {
      const nodeElement = renderTreeNode(node)
      treeContent.appendChild(nodeElement)
    })

    state.treeContainer.innerHTML = ""
    state.treeContainer.appendChild(treeContent)
  }

  function updateTreeDisplay() {
    if (!state.treeContainer) return

    state.treeContainer.querySelectorAll(".tree-checkbox").forEach((checkbox) => {
      const nodeElement = checkbox.closest(".tree-item")
      const nodeId = nodeElement.getAttribute("data-node-id")
      const isSelected = state.selectedNodes.has(nodeId)

      checkbox.checked = isSelected

      if (isSelected) {
        nodeElement.classList.add("selected")
      } else {
        nodeElement.classList.remove("selected")
      }
    })
  }

  // ==================== 선택기 관련 함수들 ====================

  function init() {
    console.log("보험 선택기 초기화 시작")

    // DOM 요소들이 존재하는지 확인 - 범위 선택 요소들로 변경
    const requiredElements = [
      "classificationType",
      "yearFromSelect",
      "yearToSelect",
      "monthFromSelect",
      "monthToSelect",
      "quarterFromSelect",
      "quarterToSelect",
      "result",
    ]

    const missingElements = requiredElements.filter((id) => !document.getElementById(id))

    if (missingElements.length > 0) {
      console.warn(`다음 요소들이 없어서 초기화를 건너뜁니다: ${missingElements.join(", ")}`)
      state.initialized = false
      return false
    }

    createYearOptions()
    const treeInitialized = initializeTree()
    bindEvents()

    // 전역 함수로 등록
    if (!window.removeItem) {
      window.removeItem = (nodeId) => {
        console.log("보험종목 제거:", nodeId)
        // 트리에서 제거하면 연관된 모든 차트도 자동으로 사라짐
        removeSelectedNode(nodeId)
      }
    }

    // 차트 관련 전역 함수들 등록 - 단순화
    window.updateMainChartType = (chartType) => {
      console.log(`메인 차트 타입 변경: ${chartType}`)
      state.combinationChart.chartType = chartType
      updateChartSummary()
    }

    window.updateChartType = (combinedId, chartType) => {
      console.log(`차트 타입 변경: ${combinedId} -> ${chartType}`)
      updateChartSummary()
    }

    // 보조축 토글 함수
    window.toggleSecondaryAxis = (combinedId) => {
      const btn = document.getElementById(`secondaryAxisBtn_${combinedId}`)
      const container = document.getElementById(`secondaryAxisContainer_${combinedId}`)
      const trueRadio = document.querySelector(`input[name="secondaryAxis_${combinedId}"][value="true"]`)
      const falseRadio = document.querySelector(`input[name="secondaryAxis_${combinedId}"][value="false"]`)

      const isCurrentlyUsed = trueRadio.checked

      if (isCurrentlyUsed) {
        // 현재 사용 중 → 미사용으로 변경
        falseRadio.checked = true
        trueRadio.checked = false

        btn.innerHTML = "❌ 미사용"
        btn.style.background = "linear-gradient(135deg, #6b7280, #4b5563)"
        btn.style.color = "white"

        container.style.background = "transparent"
        container.style.border = "2px solid transparent"
        container.style.boxShadow = "none"

        console.log(`보조축 해제: ${combinedId}`)
      } else {
        // 현재 미사용 → 사용으로 변경 (다른 보조축들 자동 해제)

        // 다른 모든 보조축 해제
        const allSecondaryAxisBtns = document.querySelectorAll('button[id^="secondaryAxisBtn_"]')
        const allTrueRadios = document.querySelectorAll('input[name^="secondaryAxis_"][value="true"]')
        const allFalseRadios = document.querySelectorAll('input[name^="secondaryAxis_"][value="false"]')
        const allContainers = document.querySelectorAll('div[id^="secondaryAxisContainer_"]')

        // 모든 보조축을 미사용으로 설정
        allTrueRadios.forEach((radio) => (radio.checked = false))
        allFalseRadios.forEach((radio) => (radio.checked = true))
        allSecondaryAxisBtns.forEach((button) => {
          button.innerHTML = "❌ 미사용"
          button.style.background = "linear-gradient(135deg, #6b7280, #4b5563)"
          button.style.color = "white"
        })
        allContainers.forEach((cont) => {
          cont.style.background = "transparent"
          cont.style.border = "2px solid transparent"
          cont.style.boxShadow = "none"
        })

        // 현재 항목만 사용으로 설정
        trueRadio.checked = true
        falseRadio.checked = false

        btn.innerHTML = "✅ 사용중"
        btn.style.background = "linear-gradient(135deg, #f59e0b, #d97706)"
        btn.style.color = "white"

        console.log(`보조축 설정: ${combinedId}`)

        if (allSecondaryAxisBtns.length > 1) {
          alert("⚠️ 보조축은 1개만 사용할 수 있습니다. 다른 보조축이 자동으로 해제되었습니다.")
        }
      }

      updateChartSummary()
    }

    window.removeChartItem = (combinedId) => {
      console.log("차트 항목 제거:", combinedId)

      // combinedId에서 nodeId와 stateItemId 추출 (예: "1-1-1_state123" → ["1-1-1", "state123"])
      const [nodeId, stateItemId] = combinedId.split("_")

      // 1. 해당 상태항목이 다른 보험종목에서도 사용 중인지 확인
      const selectedNodes = Array.from(state.selectedNodes.values())
      const otherNodesUsingThisState = selectedNodes.filter((node) => node.id !== nodeId)

      // 다른 보험종목이 있고, 해당 상태항목이 선택되어 있는지 확인
      const shouldKeepStateItemChecked = otherNodesUsingThisState.length > 0

      if (!shouldKeepStateItemChecked) {
        // 다른 보험종목에서 사용하지 않으면 상태항목 체크해제
        const stateItemCheckbox = document.querySelector(`#state-items-container input[value="${stateItemId}"]`)
        if (stateItemCheckbox) {
          stateItemCheckbox.checked = false
          console.log(`상태항목 체크해제: ${stateItemId} (다른 보험종목에서 미사용)`)
        }
      } else {
        console.log(`상태항목 유지: ${stateItemId} (다른 보험종목에서 사용 중)`)
      }

      // 2. 상태항목 선택 상태 업데이트
      updateSelectedStateItems()

      // 3. 해당 노드와 관련된 다른 차트가 있는지 확인
      const selectedStateItems = getSelectedStateItems()
      const hasOtherCharts = selectedStateItems.length > 0

      if (!hasOtherCharts) {
        // 다른 차트가 없으면 트리에서도 완전히 제거
        console.log(`노드 ${nodeId}의 마지막 차트 제거 - 트리에서도 제거`)
        removeSelectedNode(nodeId)
      } else {
        // 다른 차트가 있으면 차트 설정만 다시 렌더링
        console.log(`노드 ${nodeId}의 차트 중 일부만 제거 - 차트 설정만 업데이트`)
        updateChartSettingsVisibility()
      }
    }

    updateResult()
    state.initialized = true
    console.log("보험 선택기 초기화 완료")
    return true
  }

  // ... (기존 bindEvents, createYearOptions, onTypeChange 등의 함수들은 동일하므로 생략)
  function bindEvents() {
    const typeSelect = document.getElementById("classificationType")

    // 범위 선택을 위한 이벤트 바인딩
    const yearFromSelect = document.getElementById("yearFromSelect")
    const yearToSelect = document.getElementById("yearToSelect")
    const monthFromSelect = document.getElementById("monthFromSelect")
    const monthToSelect = document.getElementById("monthToSelect")
    const quarterFromSelect = document.getElementById("quarterFromSelect")
    const quarterToSelect = document.getElementById("quarterToSelect")

    if (typeSelect) {
      typeSelect.addEventListener("change", onTypeChange)
    }

    // 년도 범위 이벤트
    if (yearFromSelect) {
      yearFromSelect.addEventListener("change", onYearFromChange)
    }
    if (yearToSelect) {
      yearToSelect.addEventListener("change", onYearToChange)
    }

    // 월 범위 이벤트
    if (monthFromSelect) {
      monthFromSelect.addEventListener("change", onMonthFromChange)
    }
    if (monthToSelect) {
      monthToSelect.addEventListener("change", onMonthToChange)
    }

    // 분기 범위 이벤트
    if (quarterFromSelect) {
      quarterFromSelect.addEventListener("change", onQuarterFromChange)
    }
    if (quarterToSelect) {
      quarterToSelect.addEventListener("change", onQuarterToChange)
    }
  }

  function createYearOptions() {
    const yearFromSelect = document.getElementById("yearFromSelect")
    const yearToSelect = document.getElementById("yearToSelect")

    if (!yearFromSelect || !yearToSelect) return

    const currentYear = new Date().getFullYear()

    // 기존 옵션 제거 (첫 번째 옵션 제외)
    while (yearFromSelect.children.length > 1) {
      yearFromSelect.removeChild(yearFromSelect.lastChild)
    }
    while (yearToSelect.children.length > 1) {
      yearToSelect.removeChild(yearToSelect.lastChild)
    }

    // 년도 옵션 추가
    for (let year = currentYear; year >= currentYear - 10; year--) {
      const optionFrom = document.createElement("option")
      optionFrom.value = year
      optionFrom.textContent = `${year}년`
      yearFromSelect.appendChild(optionFrom)

      const optionTo = document.createElement("option")
      optionTo.value = year
      optionTo.textContent = `${year}년`
      yearToSelect.appendChild(optionTo)
    }
  }

  function onTypeChange(event) {
    state.selectedType = event.target.value
    console.log("분류 변경:", state.selectedType)

    const yearGroup = document.getElementById("yearGroup")
    const monthGroup = document.getElementById("monthGroup")
    const quarterGroup = document.getElementById("quarterGroup")

    if (yearGroup) yearGroup.classList.remove("show")
    if (monthGroup) monthGroup.classList.remove("show")
    if (quarterGroup) quarterGroup.classList.remove("show")

    resetDates()

    if (state.selectedType) {
      setTimeout(() => {
        switch (state.selectedType) {
          case "yearly":
            console.log("년도별 조회 선택됨")
            document.querySelector(".date-selector").style.gridTemplateColumns = "1fr"
            if (yearGroup) {
              yearGroup.classList.add("show")
              yearGroup.querySelector(".range-group").classList.add("row")
            }
            break
          case "monthly":
            console.log("월별 조회 선택됨")
            document.querySelector(".date-selector").style.gridTemplateColumns = "1fr 1fr"
            if (yearGroup) {
              yearGroup.classList.add("show")
              yearGroup.querySelector(".range-group").classList.remove("row")
            }
            if (monthGroup) monthGroup.classList.add("show")
            break
          case "quarterly":
            console.log("분기별 조회 선택됨")
            document.querySelector(".date-selector").style.gridTemplateColumns = "1fr 1fr"
            if (yearGroup) {
              yearGroup.classList.add("show")
              yearGroup.querySelector(".range-group").classList.remove("row")
            }
            if (quarterGroup) {
              quarterGroup.classList.add("show")
              quarterGroup.querySelector(".range-group").classList.remove("row")
            }
            break
        }
        updateResult()
        // 분류 변경 시 API 호출
        checkAndFetchStateItems()
      }, 50)
    } else {
      updateResult()
    }
  }

  // 범위 선택을 위한 이벤트 핸들러들
  function onYearFromChange(event) {
    state.selectedYearFrom = event.target.value
    console.log("시작 년도 변경:", state.selectedYearFrom)
    validateYearRange()
    updateResult()
    checkAndFetchStateItems()
  }

  function onYearToChange(event) {
    state.selectedYearTo = event.target.value
    console.log("종료 년도 변경:", state.selectedYearTo)
    validateYearRange()
    updateResult()
    checkAndFetchStateItems()
  }

  function onMonthFromChange(event) {
    state.selectedMonthFrom = event.target.value
    console.log("시작 월 변경:", state.selectedMonthFrom)
    // validateMonthRange()
    updateResult()
    checkAndFetchStateItems()
  }

  function onMonthToChange(event) {
    state.selectedMonthTo = event.target.value
    console.log("종료 월 변경:", state.selectedMonthTo)
    // validateMonthRange()
    updateResult()
    checkAndFetchStateItems()
  }

  function onQuarterFromChange(event) {
    state.selectedQuarterFrom = event.target.value
    console.log("시작 분기 변경:", state.selectedQuarterFrom)
    // validateQuarterRange()
    updateResult()
    checkAndFetchStateItems()
  }

  function onQuarterToChange(event) {
    state.selectedQuarterTo = event.target.value
    console.log("종료 분기 변경:", state.selectedQuarterTo)
    // validateQuarterRange()
    updateResult()
    checkAndFetchStateItems()
  }

  // 범위 유효성 검사 함수들
  function validateYearRange() {
    const yearFrom = Number.parseInt(state.selectedYearFrom)
    const yearTo = Number.parseInt(state.selectedYearTo)

    if (yearFrom && yearTo && yearFrom > yearTo) {
      alert("⚠️ 시작 년도는 종료 년도보다 클 수 없습니다.")
      // 자동으로 종료 년도를 시작 년도와 같게 설정
      const yearToSelect = document.getElementById("yearToSelect")
      if (yearToSelect) {
        yearToSelect.value = state.selectedYearFrom
        state.selectedYearTo = state.selectedYearFrom
      }
    }
  }

  function validateMonthRange() {
    const monthFrom = Number.parseInt(state.selectedMonthFrom)
    const monthTo = Number.parseInt(state.selectedMonthTo)

    if (monthFrom && monthTo && monthFrom > monthTo) {
      alert("⚠️ 시작 월은 종료 월보다 클 수 없습니다.")
      // 자동으로 종료 월을 시작 월과 같게 설정
      const monthToSelect = document.getElementById("monthToSelect")
      if (monthToSelect) {
        monthToSelect.value = state.selectedMonthFrom
        state.selectedMonthTo = state.selectedMonthFrom
      }
    }
  }

  function validateQuarterRange() {
    const quarterFrom = state.selectedQuarterFrom.replace("Q", "")
    const quarterTo = state.selectedQuarterTo.replace("Q", "")

    if (quarterFrom && quarterTo && Number.parseInt(quarterFrom) > Number.parseInt(quarterTo)) {
      alert("⚠️ 시작 분기는 종료 분기보다 클 수 없습니다.")
      // 자동으로 종료 분기를 시작 분기와 같게 설정
      const quarterToSelect = document.getElementById("quarterToSelect")
      if (quarterToSelect) {
        quarterToSelect.value = state.selectedQuarterFrom
        state.selectedQuarterTo = state.selectedQuarterFrom
      }
    }
  }

  function resetDates() {
    // 범위 선택 상태 초기화
    state.selectedYearFrom = ""
    state.selectedYearTo = ""
    state.selectedMonthFrom = ""
    state.selectedMonthTo = ""
    state.selectedQuarterFrom = ""
    state.selectedQuarterTo = ""

    // 선택 요소들 초기화
    const yearFromSelect = document.getElementById("yearFromSelect")
    const yearToSelect = document.getElementById("yearToSelect")
    const monthFromSelect = document.getElementById("monthFromSelect")
    const monthToSelect = document.getElementById("monthToSelect")
    const quarterFromSelect = document.getElementById("quarterFromSelect")
    const quarterToSelect = document.getElementById("quarterToSelect")

    if (yearFromSelect) yearFromSelect.value = ""
    if (yearToSelect) yearToSelect.value = ""
    if (monthFromSelect) monthFromSelect.value = ""
    if (monthToSelect) monthToSelect.value = ""
    if (quarterFromSelect) quarterFromSelect.value = ""
    if (quarterToSelect) quarterToSelect.value = ""
  }

  // 상태항목 API 호출 조건 확인 및 호출
  function checkAndFetchStateItems() {
    console.log("API 호출 조건 확인:", {
      selectedType: state.selectedType,
      selectedYearFrom: state.selectedYearFrom,
      selectedYearTo: state.selectedYearTo,
      selectedMonthFrom: state.selectedMonthFrom,
      selectedMonthTo: state.selectedMonthTo,
      selectedQuarterFrom: state.selectedQuarterFrom,
      selectedQuarterTo: state.selectedQuarterTo,
      selectedNodesCount: state.selectedNodes.size,
    })

    // 1. 분류가 선택되었는지 확인
    if (!state.selectedType) {
      console.log("❌ 분류가 선택되지 않아 API 호출하지 않음")
      clearStateItems()
      clearChartSettings()
      return
    }

    // 2. 보험종목이 최소 1개 이상 선택되었는지 확인
    if (state.selectedNodes.size === 0) {
      console.log("❌ 보험종목이 선택되지 않아 API 호출하지 않음")
      clearStateItems()
      clearChartSettings()
      return
    }

    let shouldCallApi = false

    if (state.selectedType === "yearly") {
      // 년도별 조회: 분류 + 년도 범위 + 보험종목 1개 이상
      shouldCallApi = state.selectedYearFrom && state.selectedYearTo && state.selectedNodes.size > 0
    } else if (state.selectedType === "monthly") {
      // 월별 조회: 분류 + 년도 범위 + 월 범위 + 보험종목 1개 이상
      shouldCallApi =
        state.selectedYearFrom &&
        state.selectedYearTo &&
        state.selectedMonthFrom &&
        state.selectedMonthTo &&
        state.selectedNodes.size > 0
    } else if (state.selectedType === "quarterly") {
      // 분기별 조회: 분류 + 년도 범위 + 분기 범위 + 보험종목 1개 이상
      shouldCallApi =
        state.selectedYearFrom &&
        state.selectedYearTo &&
        state.selectedQuarterFrom &&
        state.selectedQuarterTo &&
        state.selectedNodes.size > 0
    }

    if (shouldCallApi) {
      console.log("✅ 모든 API 호출 조건 충족, 상태항목 가져오기")
      fetchStateItems()
    } else {
      console.log("❌ API 호출 조건 미충족 - 상태항목 숨김")
      clearStateItems()
      clearChartSettings()
    }
  }

  // 상태항목 컨테이너 초기화
  function clearStateItems() {
    const container = document.getElementById("state-items-container")
    if (container) {
      container.innerHTML = ""
    }
  }

  function getMaxStateItemCount() {
    const selectedNodeCount = state.selectedNodes.size
    if (selectedNodeCount === 0) return 0
    return Math.floor(8 / selectedNodeCount)
  }

  function updateResult() {
    const resultElement = document.getElementById("result")
    if (!resultElement) {
      console.warn("Result element not found, skipping update")
      return
    }

    const nodes = Array.from(state.selectedNodes.values())
    const count = state.selectedNodes.size

    let html = ""

    html += `<div><strong>📊 분류:</strong> ${getTypeText(state.selectedType)}</div>`

    if (state.selectedType) {
      // 년도 범위 표시
      const yearRangeText = getDateRangeText(state.selectedYearFrom, state.selectedYearTo, "년")
      html += `<div><strong>📅 년도:</strong> ${yearRangeText}</div>`

      if (state.selectedType === "monthly") {
        // 월 범위 표시
        const monthRangeText = getDateRangeText(state.selectedMonthFrom, state.selectedMonthTo, "월", formatMonth)
        html += `<div><strong>📅 월:</strong> ${state.selectedYearFrom}년 ${formatMonth(state.selectedMonthFrom)} ~ ${state.selectedYearTo}년 ${formatMonth(state.selectedMonthTo)}</div>`
      } else if (state.selectedType === "quarterly") {
        // 분기 범위 표시
        const quarterRangeText = getDateRangeText(state.selectedQuarterFrom, state.selectedQuarterTo, "분기")
        html += `<div><strong>📅 분기:</strong> ${quarterRangeText}</div>`
      }
    }

    html += `<div><strong>🛡️ 선택된 보험종목 (${count}/4개):</strong></div>`

    if (count > 0) {
      html += `<div class="selected-items">`
      nodes.forEach((node) => {
        const path = getNodePath(node.id)
        const pathText = path ? path.map((n) => n.title).join(" > ") : node.title

        html += `
                  <div class="selected-item">
                      ${pathText}
                      <button class="remove-item" onclick="removeItem('${node.id}')" title="제거">×</button>
                  </div>
              `
      })
      html += `</div>`

      html += `<div style="margin-top: 10px; font-size: 11px; color: #0069F6;">`
      html += `선택된 ID: ${nodes.map((node) => node.id).join(", ")}`
      html += `</div>`

      // 차트 개수 제한 안내
      const maxStateItems = getMaxStateItemCount()
      html += `<div style="margin-top: 8px; padding: 8px; background: #fff; border-radius: 6px; border: 1px solid #3b82f6;">`
      html += `<span style="color: #0069F6; font-size: 12px; font-weight: 600;">📈 차트 제한:</span> `
      html += `<span style="color: #0069F6; font-size: 12px;">보험종목 ${count}개 × 상태항목 최대 ${maxStateItems}개 = 최대 ${count * maxStateItems}개 차트</span>`
      html += `</div>`
    } else {
      html += `<div style="color: #ff006e;">보험종목을 선택해주세요. (최대 4개)</div>`
    }

    // 상태항목 컨테이너 추가 (항상 표시)
    html += `<div id="state-items-container" style="margin-top: 15px;"></div>`

    // 차트 설정 컨테이너 추가 (항상 표시)
    html += `<div id="chart-settings-container" style="margin-top: 15px;"></div>`

    resultElement.innerHTML = html
  }

  // 날짜 범위 텍스트 생성 헬퍼 함수
  function getDateRangeText(fromValue, toValue, unit, formatter = null) {
    if (!fromValue && !toValue) {
      return "미선택"
    }

    if (!fromValue || !toValue) {
      const singleValue = fromValue || toValue
      const displayValue = formatter ? formatter(singleValue) : `${singleValue}${unit}`
      return `${displayValue} (범위 미완성)`
    }

    if (fromValue === toValue) {
      const displayValue = formatter ? formatter(fromValue) : `${fromValue}${unit}`
      return displayValue
    }

    const fromDisplay = formatter ? formatter(fromValue) : `${fromValue}${unit}`
    const toDisplay = formatter ? formatter(toValue) : `${toValue}${unit}`
    return `${fromDisplay} ~ ${toDisplay}`
  }

  // ==================== API 및 상태 항목 관련 함수들 ====================

  async function fetchStateItems() {
    const container = document.getElementById("state-items-container")
    if (!container) return

    try {
      // 로딩 표시
      container.innerHTML = `
      <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; border: 1px solid #404040;">
        <div style="color: #60a5fa; font-weight: 600; margin-bottom: 10px;">📊 상태 항목</div>
        <div style="color: #0069F6;">데이터를 불러오는 중...</div>
      </div>
    `

      // API 파라미터 구성
      const params = buildApiParams()

      console.log("API 호출 파라미터:", params)

      // fetchData 함수 사용
      const data = await fetchData(`http://localhost:3000/searchState`, params)

      console.log("API 응답:", data)

      // 체크박스 리스트 렌더링
      renderStateItems(data)
    } catch (error) {
      console.error("상태 항목 로드 실패:", error)
      container.innerHTML = `
      <div style="padding: 15px; background: #2a2a2a; border-radius: 8px; border: 1px solid #404040;">
        <div style="color: #60a5fa; font-weight: 600; margin-bottom: 10px;">📊 상태 항목</div>
        <div style="color: #ef4444;">데이터 로드 실패: ${error.message}</div>
      </div>
    `
    }
  }

  function buildApiParams() {
    const params = {}

    // 분류 타입
    params.type = state.selectedType

    // 년도 범위
    params.yearFrom = state.selectedYearFrom
    params.yearTo = state.selectedYearTo

    // 월 또는 분기 범위
    if (state.selectedType === "monthly") {
      if (state.selectedMonthFrom) params.monthFrom = state.selectedMonthFrom
      if (state.selectedMonthTo) params.monthTo = state.selectedMonthTo
    } else if (state.selectedType === "quarterly") {
      if (state.selectedQuarterFrom) params.quarterFrom = state.selectedQuarterFrom
      if (state.selectedQuarterTo) params.quarterTo = state.selectedQuarterTo
    }

    // 선택된 보험종목 ID들 (선택사항)
    const selectedNodeIds = Array.from(state.selectedNodes.keys())
    if (selectedNodeIds.length > 0) {
      params.insuranceIds = selectedNodeIds
    }

    return params
  }

  function renderStateItems(items) {
    const container = document.getElementById("state-items-container")
    if (!container) return

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `
      <div style="padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #0069F6;">
        <div style="color: #60a5fa; font-weight: 600; margin-bottom: 10px;">📊 상태 항목</div>
        <div style="color: #0069F6;">조회 가능한 상태 항목이 없습니다.</div>
      </div>
    `
      return
    }

    const maxStateItems = getMaxStateItemCount()

    let html = `
    <div style="padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #0069F6;">
      <div style="color: #0069F6; font-weight: 600; margin-bottom: 15px;">
        📊 상태 항목 선택 (최대 ${maxStateItems}개)
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
  `

    items.forEach((item) => {
      html += `
      <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 12px; border-radius: 8px; transition: all 0.2s ease; border: 1px solid transparent;" 
             onmouseover="this.style.background='#f1f1f1'; this.style.borderColor='#4b5563';" 
             onmouseout="this.style.background='transparent'; this.style.borderColor='transparent';">
        
        <!-- 커스텀 체크박스 -->
        <div style="position: relative; width: 20px; height: 20px; flex-shrink: 0;">
          <input type="checkbox" 
                 value="${item.id}" 
                 data-name="${item.name}"
                 style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; margin: 0;"
                 onchange="handleStateItemChange(this)">
          
          <!-- 체크박스 배경 -->
          <div class="custom-checkbox" style="
            width: 20px; 
            height: 20px; 
            border: 2px solid #6b7280; 
            border-radius: 4px; 
            background: #f1f1f1;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            position: relative;
          ">
            <!-- 체크 아이콘 -->
            <svg class="check-icon" style="
              width: 12px; 
              height: 12px; 
              color: white; 
              opacity: 0; 
              transform: scale(0.5);
              transition: all 0.2s ease;
            " viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        </div>
        
        <span style="color: #333; font-size: 14px; font-weight: 500; user-select: none;">${item.name}</span>
      </label>
    `
    })

    html += `
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #404040;">
        <div style="display: flex; gap: 10px;">
          <button type="button" onclick="selectAllStateItems()" 
                  style="padding: 8px 16px; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s ease;"
                  onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            ✓ 전체 선택 (최대 ${maxStateItems}개)
          </button>
          <button type="button" onclick="deselectAllStateItems()" 
                  style="padding: 8px 16px; background: linear-gradient(135deg, #6b7280, #4b5563); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s ease;"
                  onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(107, 114, 128, 0.3)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            ✗ 전체 해제
          </button>
        </div>
        <div id="selected-state-items" style="margin-top: 12px; font-size: 12px; color: #0069F6; font-weight: 500;">
          선택된 항목: 없음 (최대 ${maxStateItems}개 선택 가능)
        </div>
      </div>
    </div>

    <style>
      /* 체크박스 선택 시 스타일 */
      input[type="checkbox"]:checked + .custom-checkbox {
        background: linear-gradient(135deg, #3b82f6, #1e40af) !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
      
      input[type="checkbox"]:checked + .custom-checkbox .check-icon {
        opacity: 1 !important;
        transform: scale(1) !important;
      }
      
      /* 호버 효과 */
      label:hover .custom-checkbox {
        border-color: #0069F6;
        background: #2a2a2a;
      }
      
      input[type="checkbox"]:checked + .custom-checkbox:hover {
        background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
      }
    </style>
  `

    container.innerHTML = html
  }

  // 전역 함수들 (HTML에서 호출)
  window.handleStateItemChange = (checkbox) => {
    const maxStateItems = getMaxStateItemCount()
    const currentChecked = document.querySelectorAll('#state-items-container input[type="checkbox"]:checked').length

    if (checkbox.checked && currentChecked > maxStateItems) {
      checkbox.checked = false
      alert(
        `⚠️ 현재 보험종목 ${state.selectedNodes.size}개 선택 시 상태항목은 최대 ${maxStateItems}개까지 선택할 수 있습니다.\n(최대 차트 개수: 8개)`,
      )
      return
    }

    updateSelectedStateItems()
    updateChartSettingsVisibility()
  }

  window.selectAllStateItems = () => {
    const checkboxes = document.querySelectorAll('#state-items-container input[type="checkbox"]')
    const maxStateItems = getMaxStateItemCount()

    // 모든 체크박스 해제 후 최대 개수만큼 선택
    checkboxes.forEach((cb) => (cb.checked = false))

    for (let i = 0; i < Math.min(checkboxes.length, maxStateItems); i++) {
      checkboxes[i].checked = true
    }

    updateSelectedStateItems()
    updateChartSettingsVisibility()

    if (checkboxes.length > maxStateItems) {
      alert(
        `⚠️ 현재 보험종목 ${state.selectedNodes.size}개 선택 시 상태항목은 최대 ${maxStateItems}개까지 선택할 수 있어 처음 ${maxStateItems}개만 선택되었습니다.`,
      )
    }
  }

  window.deselectAllStateItems = () => {
    const checkboxes = document.querySelectorAll('#state-items-container input[type="checkbox"]')
    checkboxes.forEach((cb) => (cb.checked = false))
    updateSelectedStateItems()
    updateChartSettingsVisibility()
  }

  function updateSelectedStateItems() {
    const checkboxes = document.querySelectorAll('#state-items-container input[type="checkbox"]:checked')
    const selectedDiv = document.getElementById("selected-state-items")
    const maxStateItems = getMaxStateItemCount()

    // 이 줄을 추가하여 상태 배열을 업데이트합니다
    state.selectedStateItems = Array.from(checkboxes).map((cb) => cb.value)

    if (!selectedDiv) return

    if (checkboxes.length === 0) {
      selectedDiv.innerHTML = `선택된 항목: 없음 (최대 ${maxStateItems}개 선택 가능)`
      selectedDiv.style.color = "#0069F6"
    } else {
      const selectedNames = Array.from(checkboxes).map((cb) => cb.dataset.name)
      selectedDiv.innerHTML = `
      <span style="color: #34d399;">✓ 선택된 항목 (${checkboxes.length}/${maxStateItems}개):</span> 
      <span style="color: #333;">${selectedNames.join(", ")}</span>
    `
    }

    // 상태가 업데이트되는지 확인하기 위한 콘솔 로그 추가
    console.log("선택된 상태항목 배열 업데이트:", state.selectedStateItems)
  }

  // 선택된 상태 항목들 가져오기
  function getSelectedStateItems() {
    const checkboxes = document.querySelectorAll('#state-items-container input[type="checkbox"]:checked')
    return Array.from(checkboxes).map((cb) => ({
      id: cb.value,
      name: cb.dataset.name,
    }))
  }

  function getTypeText(type) {
    switch (type) {
      case "yearly":
        return "년도별 조회"
      case "monthly":
        return "월별 조회"
      case "quarterly":
        return "분기별 조회"
      default:
        return "미선택"
    }
  }

  function formatMonth(month) {
    const months = {
      "01": "1월",
      "02": "2월",
      "03": "3월",
      "04": "4월",
      "05": "5월",
      "06": "6월",
      "07": "7월",
      "08": "8월",
      "09": "9월",
      10: "10월",
      11: "11월",
      12: "12월",
    }
    return months[month] || month
  }

  // 차트 설정 컨테이너 초기화
  function clearChartSettings() {
    const container = document.getElementById("chart-settings-container")
    if (container) {
      container.innerHTML = ""
    }
  }

  // 상태항목 선택 상태에 따라 차트 설정 표시/숨김
  function updateChartSettingsVisibility() {
    const selectedStateItems = getSelectedStateItems()

    if (selectedStateItems.length > 0 && state.selectedNodes.size > 0) {
      console.log("✅ 상태항목과 보험종목이 모두 선택됨 - 차트 설정 표시")
      renderChartSettings()
    } else {
      console.log("❌ 상태항목 또는 보험종목이 선택되지 않음 - 차트 설정 숨김")
      clearChartSettings()
    }
  }

  // 차트 설정 렌더링
  function renderChartSettings() {
    const container = document.getElementById("chart-settings-container")
    if (!container) return

    const selectedNodes = Array.from(state.selectedNodes.values())
    const selectedStateItems = getSelectedStateItems()

    if (selectedNodes.length === 0 || selectedStateItems.length === 0) {
      container.innerHTML = ""
      return
    }

    let html = `
<div style="padding: 20px; background: #fff; border-radius: 10px; border: 1px solid #0069F6; margin-top: 15px;">
  <div style="color: #60a5fa; font-weight: 700; font-size: 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
    📈 차트종류
  </div>
  <div style="display: flex; flex-direction: column; gap: 15px;">
`

    // 보험종목과 상태항목의 조합으로 차트 설정 생성
    selectedNodes.forEach((node) => {
      const nodePath = getNodePath(node.id)
      const nodePathText = nodePath ? nodePath.map((n) => n.title).join(" > ") : node.title

      selectedStateItems.forEach((stateItem) => {
        const combinedId = `${node.id}_${stateItem.id}`
        const fullPath = `${nodePathText} > ${stateItem.name}`
        // <button onclick="removeChartItem('${combinedId}')"
        //         style="
        //           background: rgba(255, 255, 255, 0.2);
        //           border: none;
        //           color: white;
        //           border-radius: 50%;
        //           width: 24px;
        //           height: 24px;
        //           cursor: pointer;
        //           font-size: 14px;
        //           font-weight: bold;
        //           display: flex;
        //           align-items: center;
        //           justify-content: space-between;
        //         "
        //         onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'"
        //         onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'"
        //         title="차트에서 제거">×</button>
        html += `
    <div style="
      padding: 15px; 
      background: linear-gradient(135deg, #1e3a8a20, #1e40af15); 
      border-radius: 8px; 
      border: 1px solid #0069F6;
      transition: all 0.3s ease;
    " onmouseover="this.style.borderColor='#60a5fa'" onmouseout="this.style.borderColor='#525252'">
      
      <!-- 보험종목 + 상태항목 경로 -->
      <div style="
        color: #fff; 
        font-weight: 600; 
        font-size: 14px; 
        margin-bottom: 15px;
        padding: 8px 12px;
        background: linear-gradient(135deg, #059669, #047857);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <span>🛡️ ${fullPath}</span>
        
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: flex-start;">
        
        <!-- 차트 타입 선택 -->
        <div class="form-group">
          <label style="
            display: block; 
            color: #0069F6; 
            font-weight: 600; 
            font-size: 13px; 
          ">📊 차트 타입</label>
          <select id="chartType_${combinedId}" 
                  onchange="updateChartType('${combinedId}', this.value)"
                  class="form-select"
                  onfocus="this.style.borderColor='#60a5fa'"
                  onblur="this.style.borderColor='#525252'">
            <option value="column">📊 막대차트</option>
            <option value="spline">📈 라인차트</option>
          </select>
        </div>
        
        <!-- 보조축 사용 여부 -->
        <div>
          <label style="
            display: block; 
            color: #0069F6; 
            font-weight: 600; 
            font-size: 13px; 
            margin-bottom: 8px;
          ">⚙️ 보조축 설정</label>
          <div style="
            display: flex; 
            align-items: center;
            flex-direction: column;
            gap: 12px;
            border-radius: 8px;
            transition: all 0.3s ease;
          " id="secondaryAxisContainer_${combinedId}">
            
            <!-- 단일 토글 버튼 -->
            <button type="button" 
                    id="secondaryAxisBtn_${combinedId}"
                    onclick="toggleSecondaryAxis('${combinedId}')"
                    style="
                      padding: 8px 16px;
                      border: none;
                      border-radius: 6px;
                      cursor: pointer;
                      font-size: 13px;
                      font-weight: 600;
                      transition: all 0.3s ease;
                      background: linear-gradient(135deg, #6b7280, #4b5563);
                      color: white;
                      min-width: 80px;
                      height:56px;
                    "
                    onmouseover="this.style.transform='translateY(-1px)'"
                    onmouseout="this.style.transform='translateY(0)'">
              ❌ 미사용
            </button>
            
            <!-- 숨겨진 라디오 버튼 (기존 로직 유지용) -->
            <input type="radio" 
                   name="secondaryAxis_${combinedId}" 
                   value="false" 
                   checked
                   style="display: none;">
            <input type="radio" 
                   name="secondaryAxis_${combinedId}" 
                   value="true" 
                   style="display: none;">
          </div>
        </div>
        
      </div>
    </div>
    `
      })
    })

    const totalCharts = selectedNodes.length * selectedStateItems.length

    html += `
  </div>
  
  <!-- 차트 설정 요약 -->
  <div style="
    margin-top: 20px; 
    padding: 15px; 
    background: linear-gradient(135deg, #1e3a8a20, #1e40af15); 
    border-radius: 8px; 
    border: 1px solid #3b82f6;
  ">
    <div style="color: #0069F6; font-weight: 600; margin-bottom: 10px;">📋 차트 설정 요약</div>
    <div id="chart-summary" style="color: #333; font-size: 13px; line-height: 1.6;">
      ${totalCharts}개의 차트가 설정됩니다. (보험종목 ${selectedNodes.length}개 × 상태항목 ${selectedStateItems.length}개)
    </div>
  </div>
</div>
`

    container.innerHTML = html
  }

  // 차트 설정 요약 업데이트
  function updateChartSummary() {
    const summaryDiv = document.getElementById("chart-summary")
    if (!summaryDiv) return

    const selectedNodes = Array.from(state.selectedNodes.values())
    const selectedStateItems = getSelectedStateItems()

    let summaryText = `${selectedNodes.length * selectedStateItems.length}개의 차트가 설정됩니다.<br><br>`

    selectedNodes.forEach((node) => {
      const nodePath = getNodePath(node.id)
      const nodePathText = nodePath ? nodePath.map((n) => n.title).join(" > ") : node.title

      selectedStateItems.forEach((stateItem) => {
        const combinedId = `${node.id}_${stateItem.id}`
        const fullPath = `${nodePathText} > ${stateItem.name}`

        const chartTypeSelect = document.getElementById(`chartType_${combinedId}`)
        const secondaryAxisRadio = document.querySelector(`input[name="secondaryAxis_${combinedId}"][value="true"]`)

        const chartType = chartTypeSelect ? chartTypeSelect.value : "column"
        const useSecondaryAxis = secondaryAxisRadio ? secondaryAxisRadio.checked : false

        const chartTypeText =
          {
            column: "📊 막대차트",
            spline: "📈 라인차트",
          }[chartType] || "📊 막대차트"

        summaryText += `• <strong>${fullPath}</strong>: ${chartTypeText} ${useSecondaryAxis ? "(보조축 사용)" : "(주축 사용)"}<br>`
      })
    })

    summaryDiv.innerHTML = summaryText
  }

  // 차트 조합 배열 생성 함수 - 새로 추가
  function generateChartCombinations() {
    const selectedNodes = Array.from(state.selectedNodes.values())
    const selectedStateItems = getSelectedStateItems()
    const combinations = []

    selectedNodes.forEach((node) => {
      selectedStateItems.forEach((stateItem) => {
        const combinedId = `${node.id}_${stateItem.id}`

        // 차트 타입 가져오기
        const chartTypeSelect = document.getElementById(`chartType_${combinedId}`)
        const chartType = chartTypeSelect ? chartTypeSelect.value : state.combinationChart.chartType

        // 보조축 사용 여부 가져오기
        const secondaryAxisRadio = document.querySelector(`input[name="secondaryAxis_${combinedId}"][value="true"]`)
        const useSecondaryAxis = secondaryAxisRadio ? secondaryAxisRadio.checked : false

        combinations.push({
          id: node.id,
          parentId: node.parentId,
          title: node.title,
          level: node.level,
          stateItemId: stateItem.id,
          stateItemName: stateItem.name,
          chartType: chartType,
          secondaryAxis: useSecondaryAxis ? "Y" : "N",
          combinedId: combinedId,
        })
      })
    })

    return combinations
  }

  // ==================== 공개 API 수정 ====================

  function getSelection() {
    const chartCombinations = generateChartCombinations()

    return {
      type: state.selectedType,
      yearFrom: state.selectedYearFrom,
      yearTo: state.selectedYearTo,
      monthFrom: state.selectedMonthFrom,
      monthTo: state.selectedMonthTo,
      quarterFrom: state.selectedQuarterFrom,
      quarterTo: state.selectedQuarterTo,
      // 기존 nodes (2개)
      nodes: Array.from(state.selectedNodes.values()),
      count: state.selectedNodes.size,
      // 새로 추가된 정보들
      selectedStateItems: state.selectedStateItems, // 배열 형태
      combinationChart: state.combinationChart, // 단순화된 구조
      // 차트 조합 배열 (8개) - 로컬스토리지에 저장될 주요 데이터
      chartCombinations: chartCombinations,
    }
  }

  // 차트 조합만 반환하는 함수 추가
  function getChartCombinations() {
    return generateChartCombinations()
  }

  function getSelectedNodes() {
    return Array.from(state.selectedNodes.values())
  }

  function getSelectedCount() {
    return state.selectedNodes.size
  }

  function isNodeSelected(nodeId) {
    return state.selectedNodes.has(nodeId)
  }

  function isInitialized() {
    return state.initialized
  }

  // 자동 초기화 실행 (옵션)
  if (autoInit) {
    // DOM이 준비될 때까지 기다림
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init)
    } else {
      init()
    }
  }

  // 인스턴스 반환에 새 함수 추가
  return {
    // 초기화
    init,
    isInitialized,

    // 선택 관련
    getSelection,
    getSelectedNodes,
    getSelectedCount,
    isNodeSelected,
    getChartCombinations, // 새로 추가

    // 트리 관련
    selectAllNodes,
    deselectAllNodes,
    expandAllNodes,
    collapseAllNodes,

    // 유틸리티
    getNodePath,
    getTypeText,
    formatMonth,
    getDateRangeText,

    // 데이터
    data: boheomJongmogData,
    state: state,

    // 새로 추가된 상태 항목 관련 함수들
    fetchStateItems,
    getSelectedStateItems,
    getSelectedStateItemsArray, // 배열 형태로 반환
    updateSelectedStateItems,
    checkAndFetchStateItems,

    // 차트 관련 함수들
    renderChartSettings,
    clearChartSettings,
    updateChartSummary,
    getCombinationChart: () => state.combinationChart, // 단순화된 combinationChart 정보 반환
    generateChartCombinations, // 새로 추가

    // 범위 유효성 검사 함수들
    validateYearRange,
    validateMonthRange,
    validateQuarterRange,
  }
}

function getSelectedStateItemsArray() {
  return state.selectedStateItems
}

// DOM 로드 완료 시 자동 초기화 (기본 인스턴스)
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("insurance-tree")) {
    window.insuranceSelector = createInsuranceSelector("insurance-tree", true)
  }
})

// 기본 내보내기 (팩토리 함수)
export default createInsuranceSelector

async function fetchData(url, params) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`${url}?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("데이터 가져오기 실패:", error)
    throw error
  }
}
