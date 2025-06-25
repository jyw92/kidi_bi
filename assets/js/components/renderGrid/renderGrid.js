import { getTaskColor, getTaskId, getTaskTitle, getComment } from "../getTask/getTask.js"

// 그리드 렌더링 함수 개선 - 드래그 앤 드롭 기능 추가
function renderGrid(tasks) {
  const uniqueColumns = [...new Set(tasks.map((task) => task.column))]
  const grid = document.querySelector(".grid")
  const quickArea = document.querySelector(".quick--area")
  if (!grid) return

  // 로컬스토리지에 tasks 저장
  saveTasksToLocalStorage(tasks)

  grid.style.gridTemplateRows = `auto`
  grid.style.gridTemplateColumns = `auto`
  grid.innerHTML = ""

  // 1개 컬럼일 때
  if (uniqueColumns.length === 1) {
    renderSingleColumnGrid(grid, uniqueColumns, tasks)
    quickArea.classList.remove("gridx3")
  }
  // 2개 컬럼일 때
  else if (uniqueColumns.length === 2) {
    renderTwoColumnGrid(grid, uniqueColumns, tasks)

    // type01+type03 또는 type02+type04 조합일 때 gridx3 클래스 추가
    if (
      (uniqueColumns.includes("type01") && uniqueColumns.includes("type03")) ||
      (uniqueColumns.includes("type02") && uniqueColumns.includes("type04"))
    ) {
     
      if (window.innerWidth < 768) {
        quickArea.classList.remove("gridx3")
      }else{
        quickArea.classList.add("gridx3")
      }
    } else {
      quickArea.classList.remove("gridx3")
    }
  }
  // 3개 컬럼일 때
  else if (uniqueColumns.length === 3) {
    renderThreeColumnGrid(grid, uniqueColumns, tasks)
    if (window.innerWidth < 768) {
      quickArea.classList.remove("gridx3")
    }else{
      quickArea.classList.add("gridx3")
    }
  }
  // 4개 이상 컬럼일 때
  else if (uniqueColumns.length >= 4) {
    renderFourColumnGrid(grid, uniqueColumns, tasks)
    if (window.innerWidth < 768) {
      quickArea.classList.remove("gridx3")
    }else{
      quickArea.classList.add("gridx3")
    }
  }

  // 드래그 앤 드롭 이벤트 설정
  setupDragAndDrop(tasks)

  // 렌더링 완료 후 이벤트 발생
  dispatchGridRenderEvent(tasks)
}

// 드래그 앤 드롭 기능 설정
function setupDragAndDrop(tasks) {
  const gridItems = document.querySelectorAll(".grid--item")

  gridItems.forEach((item, index) => {
    // 드래그 가능하게 설정
    item.draggable = true
    item.dataset.originalIndex = index

    // 드래그 시작 이벤트
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index)
      item.classList.add("dragging")
    })

    // 드래그 종료 이벤트
    item.addEventListener("dragend", (e) => {
      item.classList.remove("dragging")
    })

    // 드래그 오버 이벤트
    item.addEventListener("dragover", (e) => {
      e.preventDefault()
      item.classList.add("drag-over")
    })

    // 드래그 리브 이벤트
    item.addEventListener("dragleave", (e) => {
      item.classList.remove("drag-over")
    })

    // 드롭 이벤트
    item.addEventListener("drop", (e) => {
      e.preventDefault()
      item.classList.remove("drag-over")

      const draggedIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))
      const targetIndex = index

      if (draggedIndex !== targetIndex) {
        handleGridItemSwap(draggedIndex, targetIndex, tasks)
      }
    })
  })
}

// 그리드 아이템 위치 교환 처리
function handleGridItemSwap(draggedIndex, targetIndex, tasks) {
  try {
    // 현재 그리드의 컬럼 타입 순서 가져오기
    const uniqueColumns = [...new Set(tasks.map((task) => task.column))]
    const gridItems = document.querySelectorAll(".grid--item")

    // 드래그된 아이템과 타겟 아이템의 컬럼 타입 결정
    const draggedColumnType = getColumnTypeByIndex(draggedIndex, uniqueColumns, tasks)
    const targetColumnType = getColumnTypeByIndex(targetIndex, uniqueColumns, tasks)

    // tasks 배열에서 해당 task들 찾기
    const draggedTask = tasks.find((task) => task.column === draggedColumnType)
    const targetTask = tasks.find((task) => task.column === targetColumnType)

    if (draggedTask && targetTask) {
      // 컬럼 속성 교환
      const tempColumn = draggedTask.column
      draggedTask.column = targetTask.column
      targetTask.column = tempColumn

      // 로컬스토리지 업데이트
      saveTasksToLocalStorage(tasks)

      // 그리드 다시 렌더링
      renderGrid(tasks)

      // 교환 완료 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("gridItemsSwapped", {
          detail: {
            draggedTask: { id: draggedTask.id, column: draggedTask.column },
            targetTask: { id: targetTask.id, column: targetTask.column },
            timestamp: Date.now(),
          },
        }),
      )
    } else {
      console.warn("교환할 task를 찾을 수 없습니다")
    }
  } catch (error) {
    console.error("그리드 아이템 교환 오류:", error)
  }
}

// 인덱스로 컬럼 타입 가져오기
function getColumnTypeByIndex(index, uniqueColumns, tasks) {
  // 그리드 레이아웃에 따라 인덱스를 컬럼 타입으로 매핑
  if (uniqueColumns.length === 1) {
    return uniqueColumns[0]
  } else if (uniqueColumns.length === 2) {
    return uniqueColumns[index] || uniqueColumns[0]
  } else if (uniqueColumns.length === 3) {
    // 3개 컬럼의 경우 레이아웃에 따라 다름
    return getThreeColumnTypeByIndex(index, uniqueColumns, tasks)
  } else if (uniqueColumns.length >= 4) {
    // 4개 컬럼의 경우 2x2 그리드
    return uniqueColumns[index] || uniqueColumns[0]
  }

  return uniqueColumns[0]
}

// 3개 컬럼 레이아웃에서 인덱스로 컬럼 타입 가져오기
function getThreeColumnTypeByIndex(index, uniqueColumns, tasks) {
  const layoutConfigs = [
    {
      columns: ["type01", "type02", "type04"],
      layout: ["type01", "type02", "type04"],
    },
    {
      columns: ["type01", "type02", "type03"],
      layout: ["type01", "type02", "type03"],
    },
    {
      columns: ["type01", "type03", "type04"],
      layout: ["type01", "type03", "type04"],
    },
    {
      columns: ["type02", "type03", "type04"],
      layout: ["type02", "type03", "type04"],
    },
  ]

  // 현재 컬럼 조합에 맞는 레이아웃 찾기
  for (const config of layoutConfigs) {
    if (hasColumnCombination(uniqueColumns, config.columns)) {
      return config.layout[index] || config.layout[0]
    }
  }

  return uniqueColumns[index] || uniqueColumns[0]
}

// 특정 컬럼으로 task 이동
function moveTaskToColumn(taskId, newColumnType) {
  try {
    const tasks = loadTasksFromLocalStorage()
    const taskIndex = tasks.findIndex((task) => task.id === taskId)

    if (taskIndex !== -1) {
      const oldColumnType = tasks[taskIndex].column
      tasks[taskIndex].column = newColumnType

      // 로컬스토리지 업데이트
      saveTasksToLocalStorage(tasks)

      // 이동 완료 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("taskMoved", {
          detail: {
            taskId,
            oldColumn: oldColumnType,
            newColumn: newColumnType,
            timestamp: Date.now(),
          },
        }),
      )

      return true
    } else {
      console.warn(`Task ${taskId}를 찾을 수 없습니다`)
      return false
    }
  } catch (error) {
    console.error("Task 이동 오류:", error)
    return false
  }
}

// 컬럼 간 task 교환
function swapTasksBetweenColumns(columnType1, columnType2) {
  try {
    const tasks = loadTasksFromLocalStorage()
    const task1 = tasks.find((task) => task.column === columnType1)
    const task2 = tasks.find((task) => task.column === columnType2)

    if (task1 && task2) {
      // 컬럼 교환
      task1.column = columnType2
      task2.column = columnType1

      // 로컬스토리지 업데이트
      saveTasksToLocalStorage(tasks)

      // 교환 완료 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("tasksSwapped", {
          detail: {
            task1: { id: task1.id, column: task1.column },
            task2: { id: task2.id, column: task2.column },
            timestamp: Date.now(),
          },
        }),
      )

      return true
    } else {
      console.warn("교환할 task를 찾을 수 없습니다")
      return false
    }
  } catch (error) {
    console.error("Task 교환 오류:", error)
    return false
  }
}

// 로컬스토리지에 tasks 저장하는 함수
function saveTasksToLocalStorage(tasks) {
  try {
    const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    const tasksString = JSON.stringify(tasks)
    const existingTasksString = JSON.stringify(existingTasks)

    if (tasksString !== existingTasksString) {
      localStorage.setItem("tasks", tasksString)

      window.dispatchEvent(
        new CustomEvent("tasksUpdated", {
          detail: { tasks, timestamp: Date.now() },
        }),
      )
    }
  } catch (error) {
    console.error("로컬스토리지 저장 오류:", error)
  }
}

// 로컬스토리지에서 tasks 불러오는 함수
function loadTasksFromLocalStorage() {
  try {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    return tasks
  } catch (error) {
    console.error("로컬스토리지 불러오기 오류:", error)
    return []
  }
}

// 그리드 렌더링 완료 이벤트 발생
function dispatchGridRenderEvent(tasks) {
  try {
    window.dispatchEvent(
      new CustomEvent("gridRendered", {
        detail: {
          tasks,
          timestamp: Date.now(),
          uniqueColumns: [...new Set(tasks.map((task) => task.column))],
        },
      }),
    )
  } catch (error) {
    console.error("이벤트 발생 오류:", error)
  }
}

function gridMobil(grid){
  // 모바일 768미만일 때
  if (window.innerWidth < 768) {
    grid.style.gridTemplateColumns = '1fr';
    grid.style.gridTemplateRows = 'auto';
  }
}

// 1개 컬럼 그리드 렌더링
function renderSingleColumnGrid(grid, uniqueColumns, tasks) {
  grid.style.gridTemplateColumns = `repeat(1, 1fr)`
  grid.style.gridTemplateRows = `repeat(1, 1fr)`
  gridMobil(grid);
  grid.innerHTML = createGridItemHTML(uniqueColumns[0], tasks)
}

// 2개 컬럼 그리드 렌더링
function renderTwoColumnGrid(grid, uniqueColumns, tasks) {
  const currentTypes = [uniqueColumns[0], uniqueColumns[1]].sort()

  // type01+type04 또는 type02+type03 조합은 가로 배치 (2x1)
  if (
    (uniqueColumns.includes("type01") && uniqueColumns.includes("type04")) ||
    (uniqueColumns.includes("type02") && uniqueColumns.includes("type03"))
  ) {
    grid.style.gridTemplateColumns = `repeat(2, 1fr)`
    grid.style.gridTemplateRows = `repeat(1, 1fr)`
    gridMobil(grid);
    // 순서 결정
    let renderOrder = [uniqueColumns[0], uniqueColumns[1]]
    if (uniqueColumns.includes("type01") && uniqueColumns.includes("type04")) {
      renderOrder = ["type01", "type04"]
    } else if (uniqueColumns.includes("type02") && uniqueColumns.includes("type03")) {
      renderOrder = ["type02", "type03"]
    }

    grid.innerHTML = createGridItemHTML(renderOrder[0], tasks) + createGridItemHTML(renderOrder[1], tasks)
  }
  // 기존 레이아웃 로직
  else {
    const layoutConfigs = {
      horizontal: [
        { types: ["type01", "type02"], order: ["type01", "type02"] },
        { types: ["type02", "type01"], order: ["type02", "type01"] },
        { types: ["type03", "type04"], order: ["type03", "type04"] },
        { types: ["type04", "type03"], order: ["type04", "type03"] },
      ],
      vertical: [
        { types: ["type01", "type03"], order: ["type01", "type03"] },
        { types: ["type03", "type01"], order: ["type03", "type01"] },
        { types: ["type02", "type04"], order: ["type02", "type04"] },
        { types: ["type04", "type02"], order: ["type04", "type02"] },
      ],
    }

    const horizontalConfig = layoutConfigs.horizontal.find((config) => {
      const configTypes = [...config.types].sort()
      return configTypes[0] === currentTypes[0] && configTypes[1] === currentTypes[1]
    })

    if (horizontalConfig) {
      grid.style.gridTemplateColumns = `repeat(2, 1fr)`
      grid.style.gridTemplateRows = `repeat(1, 1fr)`
      gridMobil(grid)
      let renderOrder = [uniqueColumns[0], uniqueColumns[1]]

      if (horizontalConfig.order) {
        if (uniqueColumns.includes(horizontalConfig.order[0]) && uniqueColumns.includes(horizontalConfig.order[1])) {
          renderOrder = horizontalConfig.order
        }
      }

      grid.innerHTML = createGridItemHTML(renderOrder[0], tasks) + createGridItemHTML(renderOrder[1], tasks)
    } else {
      grid.style.gridTemplateColumns = `repeat(1, 1fr)`
      grid.style.gridTemplateRows = `repeat(2, 1fr)`
      gridMobil(grid)
      let renderOrder = [uniqueColumns[0], uniqueColumns[1]]

      const verticalConfig = layoutConfigs.vertical.find((config) => {
        const configTypes = [...config.types].sort()
        return configTypes[0] === currentTypes[0] && configTypes[1] === currentTypes[1]
      })

      if (verticalConfig && verticalConfig.order) {
        if (uniqueColumns.includes(verticalConfig.order[0]) && uniqueColumns.includes(verticalConfig.order[1])) {
          renderOrder = verticalConfig.order
        }
      }

      grid.innerHTML = createGridItemHTML(renderOrder[0], tasks) + createGridItemHTML(renderOrder[1], tasks)
    }
  }
}

// 3개 컬럼 그리드 렌더링 - 새로운 레이아웃 적용
function renderThreeColumnGrid(grid, uniqueColumns, tasks) {
  grid.style.gridTemplateColumns = `repeat(2, 1fr)`
  grid.style.gridTemplateRows = `repeat(2, 1fr)`
  gridMobil();
  // 레이아웃 설정 배열 - 새로운 grid positioning 적용
  const layoutConfigs = [
    {
      columns: ["type01", "type02", "type04"],
      layout: [
        { type: "type01", gridColumn: "1/2", gridRow: "1/3" },
        { type: "type02", gridColumn: "2/3", gridRow: "1/2" }, // type02가 세로로 길게
        { type: "type04", gridColumn: "2/3", gridRow: "2/3" },
      ],
    },
    {
      columns: ["type01", "type02", "type03"],
      layout: [
        { type: "type01", gridColumn: "1/2", gridRow: "1/2" },
        { type: "type02", gridColumn: "2/3", gridRow: "1/3" }, // type02가 세로로 길게
        { type: "type03", gridColumn: "1/2", gridRow: "2/3" },
      ],
    },
    {
      columns: ["type01", "type03", "type04"],
      layout: [
        { type: "type01", gridColumn: "1/2", gridRow: "1/2" },
        { type: "type03", gridColumn: "1/2", gridRow: "2/3" },
        { type: "type04", gridColumn: "2/3", gridRow: "1/3" }, // type04가 가로로 길게
      ],
    },
    {
      columns: ["type02", "type03", "type04"],
      layout: [
        { type: "type02", gridColumn: "2/3", gridRow: "1/2" },
        { type: "type03", gridColumn: "1/2", gridRow: "1/3" }, // type03이 세로로 길게
        { type: "type04", gridColumn: "2/3", gridRow: "2/3" },
      ],
    },
  ]

  // 현재 컬럼 조합에 맞는 레이아웃 찾기
  let matchedLayout = null

  layoutConfigs.forEach((config) => {
    if (hasColumnCombination(uniqueColumns, config.columns)) {
      matchedLayout = config.layout
    }
  })

  // 일치하는 레이아웃이 있으면 사용, 없으면 기본 레이아웃 사용
  if (matchedLayout) {
    let gridHTML = ""

    matchedLayout.forEach((item) => {
      gridHTML += createGridItemHTML(item.type, tasks, false, item.gridColumn, item.gridRow)
    })

    grid.innerHTML = gridHTML
  } else {
    // 기본 레이아웃
    grid.innerHTML =
      createGridItemHTML(uniqueColumns[0], tasks, false, "1/2", "1/2") +
      createGridItemHTML(uniqueColumns[1], tasks, false, "2/3", "1/2") +
      createGridItemHTML(uniqueColumns[2], tasks, false, "1/3", "2/3")
  }
}

// 4개 컬럼 그리드 렌더링 - 레이아웃 설정 추가
function renderFourColumnGrid(grid, uniqueColumns, tasks) {
  grid.style.gridTemplateColumns = `repeat(2, 1fr)`;
  grid.style.gridTemplateRows = `repeat(2, 1fr)`;
  gridMobil(grid);
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

function hasColumnCombination(uniqueColumns, targetColumns) {
  return targetColumns.every((col) => uniqueColumns.includes(col))
}

// createGridItemHTML 함수 수정 - gridColumn, gridRow 파라미터 추가
function createGridItemHTML(columnType, tasks, isFullWidth = false, gridColumn = "", gridRow = "") {
  const title = getTaskTitle(columnType, tasks)
  const color = getTaskColor(columnType, tasks)
  const taskId = getTaskId(columnType, tasks)
  const comment = getComment(columnType, tasks)

  let style = ""
  if (gridColumn && gridRow) {
    style = `grid-column: ${gridColumn}; grid-row: ${gridRow};`
  } else if (isFullWidth) {
    // isFullWidth는 더 이상 사용하지 않지만 호환성을 위해 유지
    style = "grid-column: 1/3;"
  }

  return `
    <div class="grid--item" data-grid-type="chart" data-column-type="${columnType}" style="${style}">
      <div class="chart--item inner--item" data-comment="${comment}">
        <div class="grid--info--area" id="chart-${taskId}"></div>
        
      </div>
    </div>
  `
}


{/* <h3 class="grid--title" style="border-top:2px solid ${color};">${title}</h3> */}


// 내보내기
export default renderGrid
export {
  saveTasksToLocalStorage,
  loadTasksFromLocalStorage,
  moveTaskToColumn,
  swapTasksBetweenColumns,
  setupDragAndDrop,
}
