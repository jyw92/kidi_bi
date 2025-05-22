// 작업 제목 가져오기
function getTaskTitle(columnType, tasks) {
    if (!tasks || !Array.isArray(tasks)) {
      console.error('유효하지 않은 tasks 배열:', tasks);
      return "Unknown Title";
    }
    
    const task = tasks.find((task) => task.column === columnType);
    return task ? task.title : "Unknown Title";
  }
  
  // 작업 색상 가져오기 함수
  function getTaskColor(columnType, tasks) {
    if (!tasks || !Array.isArray(tasks)) {
      console.error('유효하지 않은 tasks 배열:', tasks);
      return "#ffffff"; // 기본 색상은 흰색
    }
    
    const task = tasks.find((task) => task.column === columnType);
    return task ? task.color : "#ffffff"; // 기본 색상은 흰색
  }
  
  // 작업 ID 가져오기 함수
  function getTaskId(columnType, tasks) {
    if (!tasks || !Array.isArray(tasks)) {
      console.error('유효하지 않은 tasks 배열:', tasks);
      return `unknown-${Date.now()}`;
    }
    
    const task = tasks.find((task) => task.column === columnType);
    return task ? task.id : `unknown-${Date.now()}`;
  }
  
  export {
    getTaskColor,
    getTaskTitle,
    getTaskId
  };