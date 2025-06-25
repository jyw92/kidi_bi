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
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8l-8-6-8 6v7c0 6 8 10 8 10z"/></svg>`
    } else {
      // 문서 아이콘 - 경로를 완전한 형태로 수정
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/><polyline points="14,2 14,8 20,8" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
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
    updateResult()
    checkAndFetchStateItems()
  }

  function onMonthToChange(event) {
    state.selectedMonthTo = event.target.value
    console.log("종료 월 변경:", state.selectedMonthTo)
    updateResult()
    checkAndFetchStateItems()
  }

  function onQuarterFromChange(event) {
    state.selectedQuarterFrom = event.target.value
    console.log("시작 분기 변경:", state.selectedQuarterFrom)
    updateResult()
    checkAndFetchStateItems()
  }

  function onQuarterToChange(event) {
    state.selectedQuarterTo = event.target.value
    console.log("종료 분기 변경:", state.selectedQuarterTo)
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
      console.log("✅ API 호출 조건 충족 - 상태항목 조회")
      fetchStateItems()
    } else {
      console.log("❌ API 호출 조건 미충족")
      clearStateItems()
      clearChartSettings()
    }
  }

  // 상태항목 API 호출 (실제 API 대신 더미 데이터 사용)
  async function fetchStateItems() {
    try {
      console.log("상태항목 API 호출 시작...")

      // 더미 데이터 생성 (실제로는 API 호출)
      const dummyStateItems = [
        { id: "state001", name: "신계약건수", unit: "건" },
        { id: "state002", name: "신계약금액", unit: "억원" },
        { id: "state003", name: "보험료수입", unit: "억원" },
        { id: "state004", name: "지급보험금", unit: "억원" },
        { id: "state005", name: "해약환급금", unit: "억원" },
        { id: "state006", name: "사업비", unit: "억원" },
        { id: "state007", name: "당기순이익", unit: "억원" },
        { id: "state008", name: "총자산", unit: "억원" },
      ]

      // 0.5초 지연 (실제 API 호출 시뮬레이션)
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log("상태항목 API 응답:", dummyStateItems)
      renderStateItems(dummyStateItems)
    } catch (error) {
      console.error("상태항목 API 호출 오류:", error)
      clearStateItems()
    }
  }

  // 상태항목 렌더링
  function renderStateItems(stateItems) {
    const container = document.getElementById("state-items-container")

    // 컨테이너가 없으면 동적으로 생성
    if (!container) {
      const newContainer = document.createElement("div")
      newContainer.id = "state-items-container"
      newContainer.className = "state-items-container"

      // 결과 섹션 앞에 삽입
      const resultSection = document.querySelector(".result-section")
      if (resultSection) {
        resultSection.parentNode.insertBefore(newContainer, resultSection)
      } else {
        // 결과 섹션이 없으면 폼 끝에 추가
        const formWrapper = document.querySelector(".form-group--wrapper")
        if (formWrapper) {
          formWrapper.appendChild(newContainer)
        }
      }
    }

    const stateContainer = document.getElementById("state-items-container")
    if (!stateContainer) {
      console.error("상태항목 컨테이너를 찾을 수 없습니다")
      return
    }

    // 상태항목 HTML 생성
    const stateItemsHTML = `
        <div class="state-items-section">
            <h3 class="state-items-title">📊 상태항목 선택</h3>
            <div class="state-items-grid">
                ${stateItems
                  .map(
                    (item) => `
                    <label class="state-item-checkbox">
                        <input type="checkbox" value="${item.id}" data-name="${item.name}" data-unit="${item.unit}">
                        <span class="checkmark"></span>
                        <span class="state-item-text">${item.name} (${item.unit})</span>
                    </label>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `

    stateContainer.innerHTML = stateItemsHTML

    // 상태항목 체크박스 이벤트 바인딩
    const checkboxes = stateContainer.querySelectorAll('input[type="checkbox"]')
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", onStateItemChange)
    })

    console.log("상태항목 렌더링 완료:", stateItems.length)
  }

  // 상태항목 선택 변경 이벤트
  function onStateItemChange(event) {
    const checkbox = event.target
    const stateItemId = checkbox.value
    const stateItemName = checkbox.getAttribute("data-name")
    const stateItemUnit = checkbox.getAttribute("data-unit")

    console.log(`상태항목 ${checkbox.checked ? "선택" : "해제"}:`, {
      id: stateItemId,
      name: stateItemName,
      unit: stateItemUnit,
    })

    // 상태항목 선택 상태 업데이트
    updateSelectedStateItems()

    // 차트 설정 업데이트
    updateChartSettingsVisibility()
  }

  // 선택된 상태항목 업데이트
  function updateSelectedStateItems() {
    const container = document.getElementById("state-items-container")
    if (!container) {
      state.selectedStateItems = []
      return
    }

    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked')
    state.selectedStateItems = Array.from(checkedBoxes).map((checkbox) => ({
      id: checkbox.value,
      name: checkbox.getAttribute("data-name"),
      unit: checkbox.getAttribute("data-unit"),
    }))

    console.log("선택된 상태항목 업데이트:", state.selectedStateItems)
  }

  // 선택된 상태항목 반환
  function getSelectedStateItems() {
    updateSelectedStateItems()
    return state.selectedStateItems
  }

  // 상태항목 초기화
  function clearStateItems() {
    const container = document.getElementById("state-items-container")
    if (container) {
      container.innerHTML = ""
    }
    state.selectedStateItems = []
    console.log("상태항목 초기화됨")
  }

  // 차트 설정 초기화
  function clearChartSettings() {
    const container = document.getElementById("chart-settings-container")
    if (container) {
      container.innerHTML = ""
    }
    console.log("차트 설정 초기화됨")
  }

  // 차트 설정 표시/숨김 업데이트
  function updateChartSettingsVisibility() {
    const selectedNodes = Array.from(state.selectedNodes.values())
    const selectedStateItems = getSelectedStateItems()

    console.log("차트 설정 업데이트:", {
      selectedNodes: selectedNodes.length,
      selectedStateItems: selectedStateItems.length,
    })

    if (selectedNodes.length === 0 || selectedStateItems.length === 0) {
      clearChartSettings()
      return
    }

    renderChartSettings(selectedNodes, selectedStateItems)
  }

  // 차트 설정 렌더링
  function renderChartSettings(selectedNodes, selectedStateItems) {
    const container = document.getElementById("chart-settings-container")

    // 컨테이너가 없으면 동적으로 생성
    if (!container) {
      const newContainer = document.createElement("div")
      newContainer.id = "chart-settings-container"
      newContainer.className = "chart-settings-container"

      // 결과 섹션 앞에 삽입
      const resultSection = document.querySelector(".result-section")
      if (resultSection) {
        resultSection.parentNode.insertBefore(newContainer, resultSection)
      } else {
        // 결과 섹션이 없으면 상태항목 섹션 뒤에 추가
        const stateItemsContainer = document.getElementById("state-items-container")
        if (stateItemsContainer) {
          stateItemsContainer.parentNode.insertBefore(newContainer, stateItemsContainer.nextSibling)
        }
      }
    }

    const chartContainer = document.getElementById("chart-settings-container")
    if (!chartContainer) {
      console.error("차트 설정 컨테이너를 찾을 수 없습니다")
      return
    }

    // 조합 생성 (보험종목 × 상태항목)
    const combinations = []
    selectedNodes.forEach((node) => {
      selectedStateItems.forEach((stateItem) => {
        combinations.push({
          nodeId: node.id,
          nodeTitle: node.title,
          stateItemId: stateItem.id,
          stateItemName: stateItem.name,
          stateItemUnit: stateItem.unit,
          combinedId: `${node.id}_${stateItem.id}`,
          combinedTitle: `${node.title} - ${stateItem.name}`,
        })
      })
    })

    console.log("차트 조합 생성:", combinations)

    // 차트 설정 HTML 생성
    const chartSettingsHTML = `
        <div class="chart-settings-section">
            <h3 class="chart-settings-title">🎨 차트 설정</h3>
            
            <!-- 메인 차트 타입 선택 -->
            <div class="main-chart-type-section">
                <h4>📊 메인 차트 타입</h4>
                <div class="chart-type-buttons">
                    <button type="button" class="chart-type-btn ${
                      state.combinationChart.chartType === "column" ? "active" : ""
                    }" onclick="updateMainChartType('column')">📊 세로막대</button>
                    <button type="button" class="chart-type-btn ${
                      state.combinationChart.chartType === "bar" ? "active" : ""
                    }" onclick="updateMainChartType('bar')">📈 가로막대</button>
                    <button type="button" class="chart-type-btn ${
                      state.combinationChart.chartType === "line" ? "active" : ""
                    }" onclick="updateMainChartType('line')">📉 선형</button>
                    <button type="button" class="chart-type-btn ${
                      state.combinationChart.chartType === "area" ? "active" : ""
                    }" onclick="updateMainChartType('area')">🏔️ 영역</button>
                </div>
            </div>

            <!-- 개별 차트 설정 -->
            <div class="individual-chart-settings">
                <h4>🎯 개별 차트 설정 (${combinations.length}개)</h4>
                <div class="chart-combinations-grid">
                    ${combinations
                      .map(
                        (combo) => `
                        <div class="chart-combination-item" id="chartItem_${combo.combinedId}">
                            <div class="combination-header">
                                <div class="combination-title">
                                    <span class="node-badge">${combo.nodeTitle}</span>
                                    <span class="state-badge">${combo.stateItemName}</span>
                                </div>
                                <button type="button" class="remove-chart-btn" onclick="removeChartItem('${combo.combinedId}')">❌</button>
                            </div>
                            
                            <div class="combination-settings">
                                <!-- 차트 타입 선택 -->
                                <div class="setting-group">
                                    <label>차트 타입</label>
                                    <select class="chart-type-select" onchange="updateChartType('${combo.combinedId}', this.value)">
                                        <option value="column">📊 세로막대</option>
                                        <option value="bar">📈 가로막대</option>
                                        <option value="line">📉 선형</option>
                                        <option value="area">🏔️ 영역</option>
                                        <option value="spline">🌊 곡선</option>
                                    </select>
                                </div>
                                
                                <!-- 보조축 설정 -->
                                <div class="setting-group">
                                    <label>보조축 ���용</label>
                                    <div class="secondary-axis-container" id="secondaryAxisContainer_${combo.combinedId}">
                                        <button type="button" class="secondary-axis-btn" id="secondaryAxisBtn_${combo.combinedId}" onclick="toggleSecondaryAxis('${combo.combinedId}')">❌ 미사용</button>
                                        <div class="radio-group" style="display: none;">
                                            <input type="radio" name="secondaryAxis_${combo.combinedId}" value="true" id="secondary_true_${combo.combinedId}">
                                            <input type="radio" name="secondaryAxis_${combo.combinedId}" value="false" id="secondary_false_${combo.combinedId}" checked>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
            
            <!-- 차트 요약 -->
            <div class="chart-summary-section">
                <h4>📋 차트 요약</h4>
                <div id="chart-summary" class="chart-summary-content">
                    메인 차트: ${getChartTypeText(state.combinationChart.chartType)} | 총 ${combinations.length}개 차트
                </div>
            </div>
        </div>
    `

    chartContainer.innerHTML = chartSettingsHTML

    console.log("차트 설정 렌더링 완료")
  }

  // 차트 타입 텍스트 변환
  function getChartTypeText(chartType) {
    const typeMap = {
      column: "📊 세로막대",
      bar: "📈 가로막대",
      line: "📉 선형",
      area: "🏔️ 영역",
      spline: "🌊 곡선",
    }
    return typeMap[chartType] || chartType
  }

  // 차트 요약 업데이트
  function updateChartSummary() {
    const summaryElement = document.getElementById("chart-summary")
    if (!summaryElement) return

    const selectedNodes = Array.from(state.selectedNodes.values())
    const selectedStateItems = getSelectedStateItems()
    const totalCombinations = selectedNodes.length * selectedStateItems.length

    // 보조축 사용 개수 계산
    const secondaryAxisCount = document.querySelectorAll('input[name^="secondaryAxis_"][value="true"]:checked').length

    const summaryText = `
        메인 차트: ${getChartTypeText(state.combinationChart.chartType)} | 
        총 ${totalCombinations}개 차트 | 
        보조축 사용: ${secondaryAxisCount}개
    `

    summaryElement.textContent = summaryText.trim()
    console.log("차트 요약 업데이트:", summaryText.trim())
  }

  function updateResult() {
    const resultElement = document.getElementById("result")
    if (!resultElement) return

    const selectedNodes = Array.from(state.selectedNodes.values())

    if (selectedNodes.length === 0) {
      resultElement.innerHTML = "분류와 보험 종목을 선택하면 결과가 여기에 표시됩니다."
      return
    }

    // 범위 정보 생성
    let dateRangeInfo = ""
    if (state.selectedType) {
      switch (state.selectedType) {
        case "yearly":
          if (state.selectedYearFrom && state.selectedYearTo) {
            dateRangeInfo = `📅 ${state.selectedYearFrom}년 ~ ${state.selectedYearTo}년`
          }
          break
        case "monthly":
          if (state.selectedYearFrom && state.selectedYearTo && state.selectedMonthFrom && state.selectedMonthTo) {
            dateRangeInfo = `📅 ${state.selectedYearFrom}년 ${state.selectedMonthFrom}월 ~ ${state.selectedYearTo}년 ${state.selectedMonthTo}월`
          }
          break
        case "quarterly":
          if (state.selectedYearFrom && state.selectedYearTo && state.selectedQuarterFrom && state.selectedQuarterTo) {
            dateRangeInfo = `📅 ${state.selectedYearFrom}년 ${state.selectedQuarterFrom} ~ ${state.selectedYearTo}년 ${state.selectedQuarterTo}`
          }
          break
      }
    }

    const typeText = state.selectedType
      ? { yearly: "년도별 조회", monthly: "월별 조회", quarterly: "분기별 조회" }[state.selectedType]
      : ""

    const resultHTML = `
        <div class="result-content">
            <div class="result-header">
                <h4>📊 ${typeText}</h4>
                ${dateRangeInfo ? `<p class="date-range">${dateRangeInfo}</p>` : ""}
            </div>
            
            <div class="selected-items">
                <h5>🛡️ 선택된 보험 종목 (${selectedNodes.length}/4)</h5>
                <div class="selected-nodes-list">
                    ${selectedNodes
                      .map((node) => {
                        const path = getNodePath(node.id)
                        const pathText = path ? path.map((p) => p.title).join(" > ") : node.title
                        return `
                            <div class="selected-node-item">
                                <span class="node-path">${pathText}</span>
                                <button type="button" class="remove-node-btn" onclick="removeItem('${node.id}')">❌</button>
                            </div>
                        `
                      })
                      .join("")}
                </div>
            </div>
        </div>
    `

    resultElement.innerHTML = resultHTML
  }

  // ==================== 공개 API ====================

  // 현재 선택 상태 반환 (차트 조합 포함)
  function getSelection() {
    const selectedNodes = Array.from(state.selectedNodes.values())
    const selectedStateItems = getSelectedStateItems()

    // 차트 조합 생성
    const chartCombinations = []
    selectedNodes.forEach((node) => {
      selectedStateItems.forEach((stateItem) => {
        const combinedId = `${node.id}_${stateItem.id}`

        // 차트 타입 가져오기
        const chartTypeSelect = document.querySelector(`.chart-type-select[onchange*="${combinedId}"]`)
        const chartType = chartTypeSelect ? chartTypeSelect.value : "column"

        // 보조축 사용 여부 가져오기
        const secondaryAxisRadio = document.querySelector(`input[name="secondaryAxis_${combinedId}"][value="true"]`)
        const useSecondaryAxis = secondaryAxisRadio ? secondaryAxisRadio.checked : false

        chartCombinations.push({
          nodeId: node.id,
          title: node.title,
          stateItemId: stateItem.id,
          stateItemName: stateItem.name,
          stateItemUnit: stateItem.unit,
          combinedId: combinedId,
          chartType: chartType,
          useSecondaryAxis: useSecondaryAxis,
        })
      })
    })

    const selection = {
      // 기본 선택 정보
      type: state.selectedType,
      yearFrom: state.selectedYearFrom,
      yearTo: state.selectedYearTo,
      monthFrom: state.selectedMonthFrom,
      monthTo: state.selectedMonthTo,
      quarterFrom: state.selectedQuarterFrom,
      quarterTo: state.selectedQuarterTo,

      // 선택된 항목들
      selectedNodes: selectedNodes,
      selectedStateItems: selectedStateItems,

      // 차트 설정
      mainChartType: state.combinationChart.chartType,
      chartCombinations: chartCombinations,

      // 요약 정보
      count: chartCombinations.length,
      nodeCount: selectedNodes.length,
      stateItemCount: selectedStateItems.length,
    }

    console.log("현재 선택 상태:", selection)
    return selection
  }

  // 선택 상태 복원
  function restoreSelection(selectionData) {
    if (!selectionData) {
      console.warn("복원할 선택 데이터가 없습니다")
      return false
    }

    console.log("선택 상태 복원 시작:", selectionData)

    try {
      // 1. 기본 선택 상태 복원
      state.selectedType = selectionData.type || ""
      state.selectedYearFrom = selectionData.yearFrom || ""
      state.selectedYearTo = selectionData.yearTo || ""
      state.selectedMonthFrom = selectionData.monthFrom || ""
      state.selectedMonthTo = selectionData.monthTo || ""
      state.selectedQuarterFrom = selectionData.quarterFrom || ""
      state.selectedQuarterTo = selectionData.quarterTo || ""

      // 2. 메인 차트 타입 복원
      if (selectionData.mainChartType) {
        state.combinationChart.chartType = selectionData.mainChartType
      }

      // 3. DOM 요소 상태 복원
      const typeSelect = document.getElementById("classificationType")
      if (typeSelect) typeSelect.value = state.selectedType

      const yearFromSelect = document.getElementById("yearFromSelect")
      if (yearFromSelect) yearFromSelect.value = state.selectedYearFrom

      const yearToSelect = document.getElementById("yearToSelect")
      if (yearToSelect) yearToSelect.value = state.selectedYearTo

      const monthFromSelect = document.getElementById("monthFromSelect")
      if (monthFromSelect) monthFromSelect.value = state.selectedMonthFrom

      const monthToSelect = document.getElementById("monthToSelect")
      if (monthToSelect) monthToSelect.value = state.selectedMonthTo

      const quarterFromSelect = document.getElementById("quarterFromSelect")
      if (quarterFromSelect) quarterFromSelect.value = state.selectedQuarterFrom

      const quarterToSelect = document.getElementById("quarterToSelect")
      if (quarterToSelect) quarterToSelect.value = state.selectedQuarterTo

      // 4. 선택된 노드 복원
      state.selectedNodes.clear()
      if (selectionData.selectedNodes && Array.isArray(selectionData.selectedNodes)) {
        selectionData.selectedNodes.forEach((node) => {
          state.selectedNodes.set(node.id, node)
        })
      }

      // 5. 분류 변경 이벤트 트리거 (UI 업데이트)
      if (typeSelect && state.selectedType) {
        const changeEvent = new Event("change", { bubbles: true })
        typeSelect.dispatchEvent(changeEvent)
      }

      // 6. 트리 및 결과 업데이트
      setTimeout(() => {
        updateTreeDisplay()
        updateResult()

        // 7. 상태항목 복원 (차트 조합이 있는 경우)
        if (selectionData.chartCombinations && selectionData.chartCombinations.length > 0) {
          // 상태항목 데이터 추출
          const uniqueStateItems = []
          const stateItemMap = new Map()

          selectionData.chartCombinations.forEach((combo) => {
            if (!stateItemMap.has(combo.stateItemId)) {
              stateItemMap.set(combo.stateItemId, {
                id: combo.stateItemId,
                name: combo.stateItemName,
                unit: combo.stateItemUnit,
              })
              uniqueStateItems.push(stateItemMap.get(combo.stateItemId))
            }
          })

          // 상태항목 렌더링
          renderStateItems(uniqueStateItems)

          // 상태항목 체크박스 상태 복원
          setTimeout(() => {
            uniqueStateItems.forEach((stateItem) => {
              const checkbox = document.querySelector(`input[value="${stateItem.id}"]`)
              if (checkbox) {
                checkbox.checked = true
              }
            })

            // 상태항목 선택 상태 업데이트
            updateSelectedStateItems()

            // 차트 설정 렌더링
            updateChartSettingsVisibility()

            // 차트 설정 복원
            setTimeout(() => {
              // 메인 차트 타입 버튼 상태 복원
              document.querySelectorAll(".chart-type-btn").forEach((btn) => {
                btn.classList.remove("active")
                if (btn.getAttribute("onclick").includes(state.combinationChart.chartType)) {
                  btn.classList.add("active")
                }
              })

              // 개별 차트 설정 복원
              selectionData.chartCombinations.forEach((combo) => {
                // 차트 타입 복원
                const chartTypeSelect = document.querySelector(`.chart-type-select[onchange*="${combo.combinedId}"]`)
                if (chartTypeSelect) {
                  chartTypeSelect.value = combo.chartType || "column"
                }

                // 보조축 설정 복원
                if (combo.useSecondaryAxis) {
                  const trueRadio = document.querySelector(
                    `input[name="secondaryAxis_${combo.combinedId}"][value="true"]`,
                  )
                  const falseRadio = document.querySelector(
                    `input[name="secondaryAxis_${combo.combinedId}"][value="false"]`,
                  )
                  const btn = document.getElementById(`secondaryAxisBtn_${combo.combinedId}`)

                  if (trueRadio && falseRadio && btn) {
                    trueRadio.checked = true
                    falseRadio.checked = false
                    btn.innerHTML = "✅ 사용중"
                    btn.style.background = "linear-gradient(135deg, #f59e0b, #d97706)"
                    btn.style.color = "white"
                  }
                }
              })

              updateChartSummary()
              console.log("선택 상태 복원 완료")
            }, 200)
          }, 100)
        }
      }, 100)

      return true
    } catch (error) {
      console.error("선택 상태 복원 중 오류:", error)
      return false
    }
  }

  // 선택 상태 초기화
  function clearSelection() {
    // 상태 초기화
    state.selectedType = ""
    state.selectedYearFrom = ""
    state.selectedYearTo = ""
    state.selectedMonthFrom = ""
    state.selectedMonthTo = ""
    state.selectedQuarterFrom = ""
    state.selectedQuarterTo = ""
    state.selectedNodes.clear()
    state.selectedStateItems = []
    state.combinationChart.chartType = "column"

    // DOM 초기화
    resetDates()
    const typeSelect = document.getElementById("classificationType")
    if (typeSelect) typeSelect.value = ""

    // UI 업데이트
    updateTreeDisplay()
    updateResult()
    clearStateItems()
    clearChartSettings()

    console.log("선택 상태 초기화 완료")
  }

  // 자동 초기화 실행
  if (autoInit) {
    // DOM이 준비될 때까지 대기
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(init, 100)
      })
    } else {
      setTimeout(init, 100)
    }
  }

  // 공개 API 반환
  return {
    // 초기화
    init,

    // 선택 관리
    getSelection,
    restoreSelection,
    clearSelection,

    // 트리 관리
    selectAllNodes,
    deselectAllNodes,
    expandAllNodes,
    collapseAllNodes,

    // 상태 확인
    isInitialized: () => state.initialized,
    getSelectedNodes: () => Array.from(state.selectedNodes.values()),
    getSelectedStateItems,

    // 내부 상태 접근 (디버깅용)
    _getState: () => ({ ...state }),
  }
}

export default createInsuranceSelector
