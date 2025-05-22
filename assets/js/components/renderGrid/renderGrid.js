import { getTaskColor, getTaskId, getTaskTitle } from "../getTask/getTask.js";

// 그리드 렌더링 함수 개선
function renderGrid(tasks) {
  const uniqueColumns = [...new Set(tasks.map((task) => task.column))];
  const grid = document.querySelector(".grid");

  if (!grid) return;

  grid.style.gridTemplateRows = `auto`;
  grid.style.gridTemplateColumns = `auto`;
  grid.innerHTML = "";

  // 1개 컬럼일 때
  if (uniqueColumns.length === 1) {
    renderSingleColumnGrid(grid, uniqueColumns, tasks); // tasks 매개변수 추가
  }
  // 2개 컬럼일 때
  else if (uniqueColumns.length === 2) {
    renderTwoColumnGrid(grid, uniqueColumns, tasks); // tasks 매개변수 추가
  }
  // 3개 컬럼일 때
  else if (uniqueColumns.length === 3) {
    renderThreeColumnGrid(grid, uniqueColumns, tasks); // tasks 매개변수 추가
  }
  // 4개 이상 컬럼일 때
  else if (uniqueColumns.length >= 4) {
    renderFourColumnGrid(grid, uniqueColumns, tasks); // tasks 매개변수 추가
  }
}

// 1개 컬럼 그리드 렌더링 - 간소화
function renderSingleColumnGrid(grid, uniqueColumns, tasks) {
  grid.style.gridTemplateColumns = `repeat(1, 1fr)`;
  grid.style.gridTemplateRows = `repeat(1, 1fr)`;

  grid.innerHTML = createGridItemHTML(uniqueColumns[0], tasks);
}

// 2개 컬럼 그리드 렌더링 - 간소화
function renderTwoColumnGrid(grid, uniqueColumns, tasks) {
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
      createGridItemHTML("type01", tasks) + createGridItemHTML("type02", tasks);
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
function renderThreeColumnGrid(grid, uniqueColumns, tasks) {
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
function renderFourColumnGrid(grid, uniqueColumns, tasks) {
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

// 그리드 아이템 HTML 생성 함수
function createGridItemHTML(columnType, tasks, isFullWidth = false) {
  const title = getTaskTitle(columnType, tasks);
  const color = getTaskColor(columnType, tasks);
  const taskId = getTaskId(columnType, tasks);
  const spanStyle = isFullWidth ? "grid-column: 1 / -1;" : "";

  return `
    <div class="grid--item" data-grid-type="chart" style="${spanStyle} background-color: ${color}5a;">
      <div class="chart--item inner--item">
        <h3 class="grid--title">${title}</h3>
        <div class="grid--info--area" id="chart-${taskId}"></div>
      </div>
    </div>
  `;
}

export default renderGrid;
