 // 컨트롤러 추가
 function addController() {
    document.querySelectorAll(".task-list").forEach((taskList) => {
      const addTaskButton = taskList.querySelector(".add-task");
      const hasTask = taskList.querySelector(".task") !== null;
      if (addTaskButton)
        addTaskButton.style.display = hasTask ? "none" : "flex";
    });
  }

  export default addController;