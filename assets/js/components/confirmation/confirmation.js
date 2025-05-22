import addController from "../addController/addController.js";

// 확인 메시지 표시
function showConfirmation(message) {
  const modal = document.getElementById("confirmationModal");
  const messageElement = document.getElementById("confirmationMessage");

  let displayMessage = message;
  if (message.includes("삭제")) displayMessage = "차트 삭제 완료 🗑️";
  else if (message.includes("업데이트")) displayMessage = "차트 수정 완료 🎉";
  else if (message.includes("생성")) displayMessage = "차트 생성 완료 🎉";

  messageElement.textContent = displayMessage;
  modal.classList.add("show");
  addController();
  setTimeout(() => modal.classList.remove("show"), 1000);
}

export default showConfirmation;
