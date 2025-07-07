function showNotification(message, display) {
  let notification = document.querySelector(".custom-notification");

  notification.innerHTML = message;
  if (display) {
    notification.classList.add("show");
  } else {
    notification.classList.remove("show");
  }
}

export default showNotification;