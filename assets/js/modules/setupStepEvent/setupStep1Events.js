import createCards from "../../components/createCards.js";
import { fetchStep01Data } from '../../components/fetchData.js'
import showNotification from '../setupStepHelper/showNotification.js'
import { store } from "../../store/store.js";

async function setupStep1Events() {
  showNotification("", false);

  const state = store.getState();
  const cardContainer = document.querySelector(".card--container");
  const data = await fetchStep01Data();
  cardContainer.innerHTML = "";
  await createCards("step01", data);

  const cards = document.querySelectorAll(
    '[data-barba-namespace="step1"] .card'
  );
  const nextButton = document.querySelector(".next-button");
  let selectedCard = null;

  if (state.type) {
    cards.forEach((card) => {
      if (card.dataset.type === state.type) {
        card.classList.add("selected");
        selectedCard = card;
      }
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", function () {
        store.dispatch({ type: "RESET_STATE" });
      if (selectedCard) {
        selectedCard.classList.remove("selected");
      }
      this.classList.add("selected");
      selectedCard = this;
    });
  });
  nextButton.addEventListener("click", () => {
    if (selectedCard) {
      const type = selectedCard.dataset.type;
      const typeName = selectedCard.dataset.typeName;
      store.dispatch({ type: "SET_TYPE", payload: { type, typeName } });
      barba.go("step2.html");
    } else {
      alert("카드를 선택해주세요.");
    }
  });
}
export default setupStep1Events;