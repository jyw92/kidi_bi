import { store } from "../store/store.js";

async function fetchLifestyleData(type, gender, ageGroup) {
  try {
    const response = await axios.get("http://localhost:3000/lifeStyleCard", {
      params: { type, gender, ageGroup },
    });
    return response.data;
  } catch (error) {
    console.error("데이터를 가져오는 중 오류가 발생했습니다.", error);
    alert("데이터를 가져오는 중 오류가 발생했습니다.");
    return [];
  }
}

async function generateCards(lifestyleData) {
  const cardContainer = document.querySelector(".card--container");
  cardContainer.innerHTML = ""; // 기존 카드 제거

  lifestyleData.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.lifeStyle = item.name;
    card.textContent = item.name;
    cardContainer.appendChild(card);
  });
}

function setupStep1Events() {
  const state = store.getState();
  console.log("step01/state", state);
  const cards = document.querySelectorAll(
    '[data-barba-namespace="step1"] .card'
  );
  const nextButton = document.querySelector(".next-button");
  let selectedCard = null;
  
  // nextButton.style.display = "none";
  
  // 뒤로 가기로 돌아왔을 때 선택 상태 복원
  if (state.type) {
    cards.forEach((card) => {
      if (card.dataset.type === state.type) {
        card.classList.add("selected");
        selectedCard = card;
        // nextButton.style.display = "flex";
      }
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", function () {
      if (selectedCard) {
        selectedCard.classList.remove("selected");
      }
      this.classList.add("selected");
      selectedCard = this;
      nextButton.style.display = "flex";
    });
  });

nextButton.addEventListener("click", () => {
    if (selectedCard) {
      const type = selectedCard.dataset.type;
      store.dispatch({ type: "SET_TYPE", payload: type });
      // incrementCurrent();
      barba.go("step2.html");
    } else {
      alert("카드를 선택해주세요.");
    }
  });
}

function setupStep2Events() {
  const state = store.getState();
  console.log("step02/state", state);
  const barbaContainer = document.querySelector('.barba-container');
  const genderCards = document.querySelectorAll("[data-gender]");
  const ageGroupCards = document.querySelectorAll("[data-age-group]");
  const nextButton = document.querySelector(".next-button");
  const prevButton = document.querySelector(".prev-button");
  const ageArea = document.querySelector('.age--area');
  let selectedGender = null;
  let selectedAgeGroup = null;
  
  // nextButton.style.display = "none";

  // 뒤로 가기로 돌아왔을 때 성별 선택아이콘 상태 복원

  if (state.gender === 'male') {
    barbaContainer.classList.remove('female');
    barbaContainer.classList.add('male');
  } else if (state.gender === 'female') {
    barbaContainer.classList.remove('male');
    barbaContainer.classList.add('female');
  }

  // 뒤로 가기로 돌아왔을 때 성별 선택 상태 복원
  if (state.gender) {
    genderCards.forEach(card => {
      if (card.dataset.gender === state.gender) {
        card.classList.add("selected");
        selectedGender = card;
      }
    });
  }
  // 뒤로 가기로 돌아왔을 때 연령대 선택 상태 복원
  if (state.ageGroup) {
    ageGroupCards.forEach(card => {
      if (card.dataset.ageGroup === state.ageGroup) {
        card.classList.add("selected");
        selectedAgeGroup = card;
      }
    });
  }

  genderCards.forEach((card) => {
    card.addEventListener("click", function () {
     
      if (selectedGender) {
        selectedGender.classList.remove("selected");
      }
      this.classList.add("selected");
      selectedGender = this;
      console.log("selectedGender", selectedGender)
      if(selectedGender.dataset.gender === 'male'){
        barbaContainer.classList.remove('female');
        barbaContainer.classList.add('male')
      }else{
        barbaContainer.classList.remove('male');
        barbaContainer.classList.add('female')
      }
      if (selectedAgeGroup) {
        // nextButton.style.display = "flex";
      }
    });
  });

  ageGroupCards.forEach((card) => {
    card.addEventListener("click", function () {
      if (selectedAgeGroup) {
        selectedAgeGroup.classList.remove("selected");
      }
      this.classList.add("selected");
      selectedAgeGroup = this;
      if (selectedGender) {
        // nextButton.style.display = "flex";
      }
    });
  });
  prevButton.addEventListener('click', () => {
    barba.go('step1.html');
  })
  nextButton.addEventListener("click", () => {
    if (selectedGender && selectedAgeGroup) {
      const gender = selectedGender.dataset.gender;
      const ageGroup = selectedAgeGroup.dataset.ageGroup;
      store.dispatch({
        type: "SET_GENDER_AND_AGE_GROUP",
        payload: { gender, ageGroup },
      });
      // incrementCurrent();
      barba.go("step3.html");
    } else {
      alert("성별과 연령대를 선택해주세요.");
    }
  });
}

async function setupStep3Events() {
  const state = store.getState();
  const loader = document.querySelector(".loader");
  console.log("step03/state", state);
  loader.style.display = "flex";
  const lifestyleData = await fetchLifestyleData(
    state.type,
    state.gender,
    state.ageGroup
  );
  await generateCards(lifestyleData);
  loader.style.display = "none";
  const cards = document.querySelectorAll(
    '[data-barba-namespace="step3"] .card'
  );
  const nextButton = document.querySelector(".next-button");
  const prevButton = document.querySelector(".prev-button");
  let selectedLifeCard = null;

  // 뒤로 가기로 돌아왔을 때 선택 상태 복원
  if (state.lifeStyle) {
    cards.forEach(card => {
      if (card.dataset.lifeStyle === state.lifeStyle) {
        card.classList.add("selected");
        selectedLifeCard = card;
        // nextButton.style.display = "flex"; 
      }
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", function () {
      if (selectedLifeCard) {
        selectedLifeCard.classList.remove("selected");
      }
      this.classList.add("selected");
      selectedLifeCard = this;
      // nextButton.style.display = "flex"; 
    });
  });

  prevButton.addEventListener('click', () => {
    barba.go('step2.html');
  });

  nextButton.addEventListener("click", () => {
    if (selectedLifeCard) {
      const lifeStyle = selectedLifeCard.dataset.lifeStyle;
      store.dispatch({ type: "SET_LIFESTYLE", payload: lifeStyle });
      barba.go("step4.html");
      // incrementCurrent();
    } else {
      alert("라이프스타일을 선택해주세요.");
    }
  });
}

function setupResultEvents() {
  const state = store.getState();
  console.log("결과 페이지 상태", state);
  //결과 페이지에 state를 사용하여 결과 표시 로직 구현.
}

function setupPageEvents(namespace) {
  let current;
  switch (namespace) {
    case "step1":
      current = 0;
      store.dispatch({ type: 'SET_CURRENT', payload: current });
      realTimeCurrentState(store.getState().current);
      setupStep1Events();
      break;
    case "step2":
      current = 1;
      store.dispatch({ type: 'SET_CURRENT', payload: current });
      realTimeCurrentState(store.getState().current);
      setupStep2Events();
      break;
    case "step3":
      current = 2
      store.dispatch({ type: 'SET_CURRENT', payload: current });
      realTimeCurrentState(store.getState().current);
      setupStep3Events();
      
      break;
    case "step4":
      current = 3
      store.dispatch({ type: 'SET_CURRENT', payload: current });
      realTimeCurrentState(store.getState().current);
      setupResultEvents();
      break;
    default:
      console.log("알 수 없는 namespace입니다.");
  }
}

function realTimeCurrentState(current){
  const currentWrap = document.querySelector('.current--wrap');
  const currentItem = currentWrap.querySelectorAll('li');
  currentItem.forEach((item) => {
    item.classList.remove('on');
  })
  currentItem[current].classList.add('on')
}


export default {
  setupStep1Events,
  setupStep2Events,
  setupStep3Events,
  setupResultEvents,
  setupPageEvents,
  realTimeCurrentState,
};
