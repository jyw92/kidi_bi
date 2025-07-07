import skeletonUI from "../../components/skeletonUI.js";
import createCards from "../../components/createCards.js";
import newRSlider from "../../components/newRSlider/newRSlider.js";
import { fetchStep04Data } from "../../components/fetchData.js";
import showNotification from '../setupStepHelper/showNotification.js'
import { store } from "../../store/store.js";
import { delay } from "../../helper/helper.js";
import scrollToInnerContent from "../../components/scrollToInnerContent.js";

/* -------------------------------------------------------------------------- */
/* global                                                                     */
/* -------------------------------------------------------------------------- */
const global = {
  GRADIENT: ["#0097A7", "#0083B0", "#2196F3", "#3F51B5", "#673AB7"],
};

// ✅ 공유 변수 및 헬퍼 함수들을 파일 최상단 또는 적절한 스코프에 정의
//  setupStep3Events함수의 헬퍼 함수들
// --------------------------------------------------------------------------
let sliderInstances = [];


function parseValueFromLabel(label) {
  if (label.includes("미만")) {
    const value = parseInt(label.split("만 미만")[0], 10) / 2;
    console.log("value==========================", value);
    return isNaN(value) ? 0 : value;
  }
  if (label.includes("이상")) {
    const value = parseInt(label.split("만 이상")[0], 10);
    return isNaN(value) ? 0 : value;
  }
  if (label.includes("~")) {
    const value01 = parseInt(label.split("~")[0], 10);
    const value02 = parseInt(label.split("~")[1], 10);
    const value = (value01 + value02) / 2;
    return isNaN(value) ? 0 : value;
  }
  return 0;
}

function getAllSliderStates() {
  const allStates = sliderInstances.map((slider) => {
    const state = slider.getValue();
    return {
      id: slider.container.closest(".category--slider--item").dataset.lifeStyle,
      selectedValue: state.value,
      selectedIndex: state.index,
    };
  });

  console.log("실시간 슬라이더 상태:", allStates);

  let currentSlidersSum = 0;
  allStates.forEach((state) => {
    currentSlidersSum += parseValueFromLabel(state.selectedValue);
  });

  const storeState = store.getState();
  if(storeState.type === '24'){
    const costState = parseInt(storeState.cost, 10) || 0;

    console.log(
      `슬라이더 합계: ${currentSlidersSum}만원, 입력된 총액: ${costState}만원`
    );
  
    // ✅ 50% 미만, 50% 초과 기준값 계산
    const lowerBound = costState * 0.5;
    const upperBound = costState * 1.5;
    let message = "";
    let shouldShow = false;
  
    // ✅ 변경된 알림 조건
    if (costState > 0) {
      if (currentSlidersSum < lowerBound) {
        // 50% 미만일 경우
        message = `
          &middot;&nbsp;사용자님이 선택한 소비수준을 합산한 결과는 평균<strong>&nbsp;${currentSlidersSum.toLocaleString()}만원&nbsp;</strong>(이상)으로 나타나며, <br>
          &middot;&nbsp;상단에 입력해주신 월 평균 소비금액인 <strong>&nbsp;${costState}만원&nbsp;</strong>과의 편차가 크게 나타납니다.<br>
          &middot;&nbsp;보다 정확한 분석을 위해서는, 상단의 월 평균 소비금액을 수정하거나 소비수준을 다시 선택하여 주시는 것을 추천드립니다.
        `;
        shouldShow = true;
      } else if (currentSlidersSum > upperBound) {
        // 50% 초과일 경우 (기존 100% 초과 포함)
        message = `
          &middot;&nbsp;사용자님이 선택한 소비수준을 합산한 결과는 평균<strong>&nbsp;${currentSlidersSum.toLocaleString()}만원&nbsp;</strong>(이상)으로 나타나며, <br>
          &middot;&nbsp;상단에 입력해주신 월 평균 소비금액인 <strong>&nbsp;${costState}만원&nbsp;</strong>과의 편차가 크게 나타납니다.<br>
          &middot;&nbsp;보다 정확한 분석을 위해서는, 상단의 월 평균 소비금액을 수정하거나 소비수준을 다시 선택하여 주시는 것을 추천드립니다.
        `;
        shouldShow = true;
      } else {
        message = "";
        shouldShow = false;
      }
    }
  
    showNotification(message, shouldShow);
  }

  return allStates;
}

function setupSliderInteraction() {
  sliderInstances.forEach((slider) => {
    slider.container.addEventListener("sliderChange", () => {
      getAllSliderStates();
    });
  });
  if (sliderInstances.length > 0) {
    getAllSliderStates();
  }
}

function generateRangeLabels(baseArray) {
  // 만약 배열이 아니면(undefined 등), 오류를 내는 대신 빈 배열 []을 반환하고 함수를 종료합니다.
  if (!Array.isArray(baseArray)) {
    return [];
  }

  const rangeArray = [];
  if (baseArray.length > 0) {
    rangeArray.push(`${baseArray[0]}만 미만`);
  }
  for (let i = 0; i < baseArray.length - 1; i++) {
    rangeArray.push(`${baseArray[i]}~${baseArray[i + 1]}만`);
  }
  if (baseArray.length > 0) {
    rangeArray.push(`${baseArray[baseArray.length - 1]}만 이상`);
  }
  return rangeArray;
}

function appTransformArray(originalArray) {
  let transformedArray = [];
  for (let i = 0; i < originalArray.length; i++) {
    transformedArray.push(originalArray[i] + "회");
  }
  transformedArray.push(transformedArray.at(-1) + " 초과");
  return transformedArray;
}

// '전체접기/펼치기' 버튼 기능을 설정하는 함수
function setupAccordionToggle() {
  const toggleButton = document.querySelector(".accordion--option--btn");
  if (!toggleButton) return;

  toggleButton.addEventListener("click", () => {
    const accordionItems = document.querySelectorAll(".category--box");
    const isCollapsing = toggleButton.textContent === "전체접기";

    if (isCollapsing) {
      accordionItems.forEach((item) => item.classList.add("close"));
      toggleButton.textContent = "전체펼치기";
    } else {
      accordionItems.forEach((item) => item.classList.remove("close"));
      toggleButton.textContent = "전체접기";
    }
  });
}

function accordionAllClose() {
  const toggleButton = document.querySelector(".accordion--option--btn");
  const accordionItems = document.querySelectorAll(".category--box");
  accordionItems.forEach((item) => item.classList.remove("close"));
  toggleButton.textContent = "전체접기";
}

// --------------------------------------------------------------------------

async function setupStep3Events() {
  const APP_BANNER_TEXT = `<p style="line-height: 1.5;">앱 배너 내용 아직 미정</p>`;
  const CARD_BANNNER_TEXT = `
    <p style="line-height: 1.5;text-align:left;">
      1. 당신의 월 평균 소비금액(카드값)을 입력하세요. <br>
      2. 아래의 카테고리별 평균 소비금액*을 참고하여, 본인의 소비수준을 선택해 주세요. <br>
      <span style="font-size:12px;">* 같은 성&middot;연령대의 평균 소비금액을 소비수준에 따라 나눈 값으로, 선택에 도움을 주기 위한 단순 지표입니다.</span>
    </p>
  `;

  const nextButton = document.querySelector(".next-button");
  const prevButton = document.querySelector(".prev-button");
  const state = store.getState();
  const cardContainer = document.querySelector(".card--container");
  const cardHeader = document.querySelector(".card--header");
  const stepBadge = document.querySelector(".card--step--wrapper > p > em");
  const instruction = document.querySelector(".instruction > p");
  const costInput = document.querySelector(
    '.input--group input[type="number"]'
  );
  const costSubmit = document.querySelector("#requestButton");
  const accordionOption = document.querySelector(".accordion--option > button");
  stepBadge.innerText = `${state.typeName} ${
    state.type === "23" ? "사용" : "소비"
  }패턴`;
  instruction.innerHTML = `${
    state.type === "23" ? APP_BANNER_TEXT : CARD_BANNNER_TEXT
  }`;

  async function handleCostSubmit(originState) {
    scrollToInnerContent();
    const currentState = store.getState();
    const costState = parseInt(currentState.cost, 10);
    if (costState > 0) {
      skeletonUI("step03", cardContainer, 6);
      await delay(1000);
      const data = await fetchStep04Data(
        currentState.type,
        currentState.gender,
        currentState.ageGroup,
        costState
      );
      cardContainer.innerHTML = "";
      await createCards("step04", data);
      const cardStyle = document.querySelectorAll(".rslider");
      cardStyle.forEach((item) => item.classList.add("card--type"));
      sliderInstances = [];
      let sliderIndex = 0;
      data.forEach((item) => {
        item.children.forEach((itemChildren) => {
          const sliderInstance = new newRSlider({
            target: `.category--slider--item[data-life-style="${itemChildren.id}"] .range--item`,
            values: generateRangeLabels(itemChildren.values),
            tooltip: true,
            scale: true,
            labels: true,
            initialValueIndex:
              originState && originState[sliderIndex]
                ? originState[sliderIndex].selectedIndex
                : 2,
            tooltipName: "나의 소비",
            gradient: global.GRADIENT,
            subLabels: true,
            subValues: generateRangeLabels(itemChildren.years),
            pointTitles: true,
            pointTitlesValues: [
              "최소소비",
              "알뜰소비",
              "평균소비",
              "여유소비",
              "풍족소비",
            ],
          });
          sliderInstances.push(sliderInstance);
          sliderIndex++;
        });
      });
      setupSliderInteraction();
      //전체 접기로 초기화
      accordionAllClose();
    } else {
      alert("나의 월 평균 소비금액을 입력해주세요.");
    }
  }

  function handleCostInput(event) {
    store.dispatch({ type: "SET_COST", payload: { cost: event.target.value } });
  }

  function handleEnterKey(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector("#requestButton").click();
    }
  }

  if (state.type === "23") {
    showNotification("", false);
    cardHeader.style.display = "none";
    skeletonUI("step03", cardContainer, 6);
    const data = await fetchStep04Data(
      state.type,
      state.gender,
      state.ageGroup
    );
    await delay(1000);
    cardContainer.innerHTML = "";
    await createCards("step04", data);

    const cardStyle = document.querySelectorAll(".rslider");
    cardStyle.forEach((item) => item.classList.add("app--type"));

    sliderInstances = [];

    // ✅ [상태 복원] 이전에 저장된 슬라이더 상태를 가져옵니다.
    const originState = state.euclideanData;
    let sliderIndex = 0; // ✅ [상태 복원] 슬라이더 인덱스 카운터

    data.forEach((item) => {
      item.children.forEach((itemChildren) => {
        const sliderInstance = new newRSlider({
          target: `.category--slider--item[data-life-style="${itemChildren.id}"] .range--item`,
          values: appTransformArray(itemChildren.values),
          tooltip: true,
          scale: true,
          labels: true,
          // ✅ [상태 복원] 저장된 값으로 초기 인덱스 설정
          initialValueIndex:
            originState && originState[sliderIndex]
              ? originState[sliderIndex].selectedIndex
              : 2,
          tooltipName: "앱사용 횟수",
          gradient: global.GRADIENT,
          subLabels: false,
          subValues: [],
          pointTitles: true,
          pointTitlesValues: ["거의없음", "드물게", "가끔", "종종", "자주"],
        });
        sliderInstances.push(sliderInstance);
        sliderIndex++; // ✅ [상태 복원] 인덱스 증가
      });
    });

    setupSliderInteraction();
    nextButton.style.display = "flex";
    accordionOption.style.display = "flex";
  } else if (state.type === "24") {
    // ================= [상태 복원 로직] =================
    if (state.cost > 0) {
      costInput.value = state.cost;
      handleCostSubmit(state.euclideanData);
      nextButton.style.display = "flex";
      accordionOption.style.display = "flex";
    } else {
      nextButton.style.display = "none";
      accordionOption.style.display = "none";
    }
    // ======================================================
   
    costInput.addEventListener("input", handleCostInput);
    costInput.addEventListener("keydown", handleEnterKey);
    costSubmit.addEventListener("click", () => {
      // 슬라이더가 이미 생성되어 있는지 확인
      if (sliderInstances.length > 0) {
        // 이미 있다면, 현재 상태를 가져와서 전달하여 위치를 유지
        const currentSliderStates = getAllSliderStates();
        handleCostSubmit(currentSliderStates);
      } else {
        // 최초 적용이라면, 기본값으로 생성
        handleCostSubmit();
      }
      nextButton.style.display = "flex";
      accordionOption.style.display = "flex";
    });
  }

  nextButton.addEventListener("click", () => {
    // ================= [상태 저장 로직] =================
    const finalStates = getAllSliderStates();
    store.dispatch({
      type: "SET_EUCLIDEAN",
      payload: { euclideanData: finalStates },
    });
    // ======================================================
    barba.go("step4.html");
  });

  prevButton.addEventListener("click", () => {
    // ================= [상태 저장 로직] =================
    const finalStates = getAllSliderStates();
    // 다음/이전 시 상태를 같은 키(euclideanData)로 저장하여 복원 로직을 단순화
    store.dispatch({
      type: "SET_EUCLIDEAN",
      payload: { euclideanData: finalStates },
    });
    // ======================================================
    barba.go("step2.html");
  });

  setupAccordionToggle();
}

export default setupStep3Events;