import createCards from "../../components/createCards.js";
import { fetchStep02Data, fetchStep03Data } from "../../components/fetchData.js";
import showNotification from '../setupStepHelper/showNotification.js'
import { store } from "../../store/store.js";

async function setupStep2Events() {
  showNotification("", false);

  const state = store.getState();
  const nextButton = document.querySelector(".next-button");
  const prevButton = document.querySelector(".prev-button");
  const cardContainerGender = document.querySelector(
    ".gender--area .card--container"
  );
  const cardContainerAge = document.querySelector(
    ".age--area .card--container"
  );
  const noneAgeData = document.querySelector(".none-data");
  let selectedGender = null;
  let selectedAgeGroup = null;

  const genderData = await fetchStep02Data();
  cardContainerGender.innerHTML = "";
  await createCards("step02", genderData);
  const genderCards = document.querySelectorAll("[data-gender]");

  function attachAgeCardEventListeners() {
    const ageGroupCards = document.querySelectorAll("[data-age-group]");
    if (state.ageGroup) {
      ageGroupCards.forEach((card) => {
        if (card.dataset.ageGroup === state.ageGroup) {
          card.classList.add("selected");
          selectedAgeGroup = card;
        }
      });
    }
    ageGroupCards.forEach((card) => {
      card.addEventListener("click", function () {
        if (selectedAgeGroup) {
          selectedAgeGroup.classList.remove("selected");
        }
        this.classList.add("selected");
        selectedAgeGroup = this;
      });
    });
  }

  if (state.gender) {
    if (noneAgeData) noneAgeData.style.display = "none";
    genderCards.forEach((card) => {
      if (card.dataset.gender === state.gender) {
        card.classList.add("selected");
        selectedGender = card;
      }
    });

    const ageData = await fetchStep03Data(state.genderName);
    cardContainerAge.innerHTML = "";
    if (noneAgeData)
      noneAgeData.style.display = ageData.length > 0 ? "none" : "flex";
    await createCards("step03", ageData);
    attachAgeCardEventListeners();
  } else {
    cardContainerAge.innerHTML = "";
    attachAgeCardEventListeners();
  }

  genderCards.forEach((card) => {
    card.addEventListener("click", async function () {
      if (selectedGender) {
        selectedGender.classList.remove("selected");
      }
      this.classList.add("selected");
      selectedGender = this;
      const genderName = selectedGender.dataset.genderName;
      const ageData = await fetchStep03Data(genderName);
      cardContainerAge.innerHTML = "";
      if (noneAgeData)
        noneAgeData.style.display = ageData.length > 0 ? "none" : "flex";
      await createCards("step03", ageData);
      attachAgeCardEventListeners();
    });
  });

  prevButton.addEventListener("click", () => {
    barba.go("step1.html");
  });
  nextButton.addEventListener("click", () => {
    if (selectedGender && selectedAgeGroup) {
      const gender = selectedGender.dataset.gender;
      const genderName = selectedGender.dataset.genderName;
      const ageGroup = selectedAgeGroup.dataset.ageGroup;
      const ageGroupName = selectedAgeGroup.dataset.ageGroupName;
      store.dispatch({
        type: "SET_GENDER_AND_AGE_GROUP",
        payload: { gender, genderName, ageGroup, ageGroupName },
      });
      barba.go("step3.html");
    } else {
      alert("성별과 연령대를 선택해주세요.");
    }
  });
}
export default setupStep2Events;