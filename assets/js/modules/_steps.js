import skeletonUI from '../components/skeletonUI.js';
import resultTemplate from '../modules/_resultTemplate.js';
import createCards from '../components/createCards.js';
import completeMessage from '../components/completeMessage.js';
import scrollToInnerContent from '../components/scrollToInnerContent.js';
import newRSlider from '../components/newRSlider/newRSlider.js';
import {store} from '../store/store.js';
import {
  fetchStep01Data,
  fetchStep02Data,
  fetchStep03Data,
  fetchStep04Data,
  fetchResultData,
} from '../components/fetchData.js';
import {Transiton} from './_index.js';
import {delay} from '../helper/helper.js';

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------------- */
/* global                                   */
/* -------------------------------------------------------------------------- */

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'both',
  smoothWheel: true,
  wheelMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

async function resultLoader() {
  const cnt = document.getElementById('count');
  const water = document.getElementById('water');
  const items = document.querySelectorAll('.select--item');
  const loadingBox = document.querySelector('.result--loading');
  let percent = 0;
  const animationDuration = 1.2; // 더 부드러운 애니메이션을 위해 속도 조절
  const totalItems = items.length;
  const percentIncrement = 100 / totalItems; // 각 아이템당 증가할 퍼센트

  gsap.set(water, {transform: 'translateY(100%)'});

  items.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect();
    const waterRect = water.getBoundingClientRect();

    const itemCenterX = itemRect.left + itemRect.width / 2;
    const itemCenterY = itemRect.top + itemRect.height / 2;

    const waterCenterX = waterRect.left + waterRect.width / 2;
    const waterCenterY = waterRect.top + waterRect.height / 2;

    const deltaX = waterCenterX - itemCenterX;
    const deltaY = waterCenterY - itemCenterY - window.scrollY; // 보정
    const delay = index * 1.0; // 딜레이를 늘려서 더 느리게

    gsap.to(item, {
      x: deltaX,
      y: deltaY,
      opacity: 0,
      scale: 0.7,
      duration: animationDuration,
      ease: 'power2.inOut', // 더 부드러운 easing 적용
      delay: delay,
      onStart: () => {
        console.log('onStart 실행됨', index);
      },
      onUpdate: () => {
        // 애니메이션 진행 중에도 퍼센트와 물 높이를 업데이트
        const progress = gsap.getProperty(item, 'progress');
        const currentPercent = Math.min(percent + percentIncrement * progress, 100);
        animatePercentage(cnt, parseInt(cnt.innerText) || 0, Math.round(currentPercent), 0.6);
        gsap.to(water, {
          y: `${100 - currentPercent}%`,
          duration: 0.6,
          ease: 'power1.out',
        });
      },
      onComplete: () => {
        percent += percentIncrement;
        if (percent > 100) percent = 100;
        animatePercentage(cnt, parseInt(cnt.innerText) || 0, Math.round(percent), 0.6); // 부드러운 퍼센트 증가
        gsap.to(water, {
          y: `${100 - percent}%`,
          duration: 0.6, // 물 애니메이션 속도 조정
          ease: 'power1.out', // 더 자연스러운 easing 적용
        });

        if (index === totalItems - 1) {
          animatePercentage(cnt, parseInt(cnt.innerText) || 0, 100, 0.6);
          gsap.to(water, {y: `0%`, duration: 0.6, ease: 'power1.out'});
        }
      },
    });

    // gsap.to(item, {
    //   x: deltaX,
    //   y: targetY,
    //   opacity: 0,
    //   scale: 0.7,
    //   duration: animationDuration,
    //   ease: 'power2.inOut', // 더 부드러운 easing 적용
    //   delay: delay,
    //   onStart: () => {
    //   console.log('onStart 실행됨', index);
    //   },
    //   onComplete: () => {
    //   percent += percentIncrement;
    //   if (percent > 100) percent = 100;
    //   animatePercentage(cnt, parseInt(cnt.innerText) || 0, Math.round(percent), 0.3); // 애니메이션 속도 증가
    //   gsap.to(water, {
    //     y: `${100 - percent}%`,
    //     duration: 0.3, // 물 애니메이션 속도 증가
    //     ease: 'power1.out', // 더 자연스러운 easing 적용
    //   });

    //   if (index === totalItems - 1) {
    //     animatePercentage(cnt, parseInt(cnt.innerText) || 0, 100, 0.3); // 최종 애니메이션 속도 증가
    //     gsap.to(water, {y: `0%`, duration: 0.3, ease: 'power1.out'});
    //   }
    //   },
    // });
  });
  function dotted() {
    const dots = document.getElementById('dots');
    let dotCount = 0;
    setInterval(() => {
      dots.textContent = '.'.repeat(dotCount);
      dotCount = dotCount === 3 ? 0 : dotCount + 1;
    }, 500);
  }
  dotted();
}

// 부드러운 퍼센트 증가를 위한 애니메이션 함수
function animatePercentage(target, start, end, duration) {
  const increment = (end - start) / (duration * 60); // 60fps 기준
  let current = start;

  function step() {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
    }
    target.innerText = Math.round(current);

    if (current !== end) {
      requestAnimationFrame(step);
    }
  }

  step();
}

async function setupStep1Events() {

  showNotification('', false);

  const state = store.getState();
  const cardContainer = document.querySelector('.card--container');
  const data = await fetchStep01Data();
  cardContainer.innerHTML = '';
  await createCards('step01', data);

  const cards = document.querySelectorAll('[data-barba-namespace="step1"] .card');
  const nextButton = document.querySelector('.next-button');
  let selectedCard = null;

  if (state.type) {
    cards.forEach((card) => {
      if (card.dataset.type === state.type) {
        card.classList.add('selected');
        selectedCard = card;
      }
    });
  }

  cards.forEach((card) => {
    card.addEventListener('click', function () {
      if (selectedCard) {
        selectedCard.classList.remove('selected');
      }
      this.classList.add('selected');
      selectedCard = this;
    });
  });
  nextButton.addEventListener('click', () => {
    if (selectedCard) {
      const type = selectedCard.dataset.type;
      const typeName = selectedCard.dataset.typeName;
      store.dispatch({type: 'SET_TYPE', payload: {type, typeName}});
      barba.go('step2.html');
    } else {
      alert('카드를 선택해주세요.');
    }
  });
}

async function setupStep2Events() {

  showNotification('', false);

  const state = store.getState();
  const nextButton = document.querySelector('.next-button');
  const prevButton = document.querySelector('.prev-button');
  const cardContainerGender = document.querySelector('.gender--area .card--container');
  const cardContainerAge = document.querySelector('.age--area .card--container');
  const noneAgeData = document.querySelector('.none-data');
  let selectedGender = null;
  let selectedAgeGroup = null;

  const genderData = await fetchStep02Data();
  cardContainerGender.innerHTML = '';
  await createCards('step02', genderData);
  const genderCards = document.querySelectorAll('[data-gender]');

  function attachAgeCardEventListeners() {
    const ageGroupCards = document.querySelectorAll('[data-age-group]');
    if (state.ageGroup) {
      ageGroupCards.forEach((card) => {
        if (card.dataset.ageGroup === state.ageGroup) {
          card.classList.add('selected');
          selectedAgeGroup = card;
        }
      });
    }
    ageGroupCards.forEach((card) => {
      card.addEventListener('click', function () {
        if (selectedAgeGroup) {
          selectedAgeGroup.classList.remove('selected');
        }
        this.classList.add('selected');
        selectedAgeGroup = this;
      });
    });
  }

  if (state.gender) {
    if(noneAgeData) noneAgeData.style.display = 'none';
    genderCards.forEach((card) => {
      if (card.dataset.gender === state.gender) {
        card.classList.add('selected');
        selectedGender = card;
      }
    });

    const ageData = await fetchStep03Data(state.genderName);
    cardContainerAge.innerHTML = '';
    if(noneAgeData) noneAgeData.style.display = ageData.length > 0 ? 'none' : 'flex';
    await createCards('step03', ageData);
    attachAgeCardEventListeners();
  } else {
    cardContainerAge.innerHTML = '';
    attachAgeCardEventListeners();
  }

  genderCards.forEach((card) => {
    card.addEventListener('click', async function () {
      if (selectedGender) {
        selectedGender.classList.remove('selected');
      }
      this.classList.add('selected');
      selectedGender = this;
      const genderName = selectedGender.dataset.genderName;
      const ageData = await fetchStep03Data(genderName);
      cardContainerAge.innerHTML = '';
      if(noneAgeData) noneAgeData.style.display = ageData.length > 0 ? 'none' : 'flex';
      await createCards('step03', ageData);
      attachAgeCardEventListeners();
    });
  });

  prevButton.addEventListener('click', () => {
    barba.go('step1.html');
  });
  nextButton.addEventListener('click', () => {
    if (selectedGender && selectedAgeGroup) {
      const gender = selectedGender.dataset.gender;
      const genderName = selectedGender.dataset.genderName;
      const ageGroup = selectedAgeGroup.dataset.ageGroup;
      const ageGroupName = selectedAgeGroup.dataset.ageGroupName;
      store.dispatch({
        type: 'SET_GENDER_AND_AGE_GROUP',
        payload: {gender, genderName, ageGroup, ageGroupName},
      });
      barba.go('step3.html');
    } else {
      alert('성별과 연령대를 선택해주세요.');
    }
  });
}

// ✅ 공유 변수 및 헬퍼 함수들을 파일 최상단 또는 적절한 스코프에 정의
// --------------------------------------------------------------------------
let sliderInstances = [];
function showNotification(message, display) {
  let notification = document.querySelector('.custom-notification');
  
  notification.textContent = message;
  if(display){
    notification.classList.add('show');
  }else{
    notification.classList.remove('show');
  }
}

function parseValueFromLabel(label) {
  if (label.includes('미만')) return 0;
  if (label.includes('이상')) {
    const value = parseInt(label.split('만 이상')[0], 10);
    return isNaN(value) ? 0 : value;
  }
  if (label.includes('~')) {
    const value = parseInt(label.split('~')[0], 10);
    return isNaN(value) ? 0 : value;
  }
  return 0;
}

function getAllSliderStates() {
  const allStates = sliderInstances.map(slider => {
    const state = slider.getValue();
    return {
      id: slider.container.closest('.category-card').dataset.lifeStyle,
      selectedValue: state.value,
      selectedIndex: state.index,
    };
  });
  
  console.log('실시간 슬라이더 상태:', allStates);

  let currentSlidersSum = 0;
  allStates.forEach(state => {
    currentSlidersSum += parseValueFromLabel(state.selectedValue);
  });

  const storeState = store.getState();
  const costState = parseInt(storeState.cost, 10) || 0;

  console.log(`슬라이더 합계: ${currentSlidersSum}만원, 입력된 총액: ${costState}만원`);

  if (costState > 0 && currentSlidersSum > costState) {
    const message = `선택하신 소비 합계(${currentSlidersSum.toLocaleString()}만원)가 월 평균 소비(${costState.toLocaleString()}만원)를 초과했습니다.`;
    showNotification(message, true);
  }else{
    const message = `선택하신 소비 합계(${currentSlidersSum.toLocaleString()}만원)가 월 평균 소비(${costState.toLocaleString()}만원)를 초과했습니다.`;
    showNotification(message, false);
  }
}

function setupSliderInteraction() {
  sliderInstances.forEach(slider => {
    slider.container.addEventListener('sliderChange', () => {
      getAllSliderStates();
    });
  });
  if (sliderInstances.length > 0) {
    getAllSliderStates();
  }
}

function generateRangeLabels(기준배열) {
    const 범위배열 = [];
    if (기준배열.length > 0) {
        범위배열.push(`${기준배열[0]}만 미만`);
    }
    for (let i = 0; i < 기준배열.length - 1; i++) {
        범위배열.push(`${기준배열[i]}~${기준배열[i + 1]}만`);
    }
    if (기준배열.length > 0) {
        범위배열.push(`${기준배열[기준배열.length - 1]}만 이상`);
    }
    return 범위배열;
}

function appTransformArray(originalArray) {
    let transformedArray = [];
    for (let i = 0; i < originalArray.length; i++) {
        transformedArray.push(originalArray[i] + '회');
    }
    transformedArray.push(transformedArray.at(-1)+" 초과");
    return transformedArray;
}
// --------------------------------------------------------------------------

async function setupStep3Events(){
  const APP_BANNER_TEXT = `<p style="line-height: 1.5;">앱 배너 내용 아직 미정</p>`;
  const CARD_BANNNER_TEXT = `<p style="line-height: 1.5;">아래는 나의 월 평균 소비금액을 기반으로 <strong>동일 성연령대의 업종별 소비 비중을 나타낸 금액</strong>입니다. <br>이를 참고하여 <strong>실제 본인의 소비 수준</strong>을 <strong>업종별로 체크</strong>해주세요.</p>`;

  const nextButton = document.querySelector('.next-button');
  const prevButton = document.querySelector('.prev-button');
  const state = store.getState();
  const cardContainer = document.querySelector('.card--container');
  const cardHeader = document.querySelector('.card--header');
  const stepBadge = document.querySelector('.card--step--wrapper > p > em');
  const instruction = document.querySelector('.instruction > p');
  const costInput =  document.querySelector('.input--group input[type="number"]');
  const costSubmit = document.querySelector('#requestButton');

  stepBadge.innerText = `${state.typeName} ${state.type === '23' ? '사용' : '소비'}패턴`;
  instruction.innerHTML = `${state.type === '23' ? APP_BANNER_TEXT : CARD_BANNNER_TEXT}`;
  
  async function handleCostSubmit() {
    const currentState = store.getState();
    const costState = parseInt(currentState.cost, 10);
    
    if (costState > 0) {
      skeletonUI('step03', cardContainer, 6);
      await delay(1000);
      const data = await fetchStep04Data(currentState.type, currentState.gender, currentState.ageGroup, costState);
      cardContainer.innerHTML = '';
      await createCards('step04', data);
      
      const cardStyle = document.querySelectorAll('.rslider');
      cardStyle.forEach(item => item.classList.add('card--type'));
      
      sliderInstances = []; 
      data.forEach(item => {
        const sliderInstance = new newRSlider({
          target: `.category-card[data-life-style="${item.id}"] .range--item`,
          values: generateRangeLabels(item.values),
          tooltip: true,
          scale: true,
          labels: true,
          initialValueIndex: 2,
          tooltipName:'나의 소비',
          gradient: ["#0097A7", "#0083B0", "#2196F3", "#3F51B5", "#673AB7"],
          subLabels: true,
          subValues: generateRangeLabels(item.years),
        });
        sliderInstances.push(sliderInstance);
      });
      
      setupSliderInteraction();
    } else {
      alert('나의 월 평균 소비금액을 입력해주세요.');
    }
  }

  function handleCostInput(event) {
    store.dispatch({ type: 'SET_COST', payload: { cost: event.target.value } });
  }

  function handleEnterKey(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.querySelector('#requestButton').click();
    }
  }

  if (state.type === '23') {
    cardHeader.style.display = 'none';
    skeletonUI('step03', cardContainer, 6);
    const data = await fetchStep04Data(state.type, state.gender, state.ageGroup);
    await delay(1000);
    cardContainer.innerHTML = '';
    await createCards('step04', data);
    
    const cardStyle = document.querySelectorAll('.rslider');
    cardStyle.forEach(item => item.classList.add('app--type'));
    
    sliderInstances = [];
    data.forEach(item => {
      const sliderInstance = new newRSlider({
        target: `.category-card[data-life-style="${item.id}"] .range--item`,
        values: appTransformArray(item.values),
        tooltip: true,
        scale: true,
        labels: true,
        initialValueIndex: 2,
        tooltipName:'앱사용 횟수',
        gradient: ["#0097A7", "#0083B0", "#2196F3", "#3F51B5", "#673AB7"],
        subLabels: false,
        subValues: [],
      });
      sliderInstances.push(sliderInstance);
    });

    setupSliderInteraction();
  } else if (state.type === '24') {
    costInput.addEventListener('input', handleCostInput);
    costInput.addEventListener('keydown', handleEnterKey);
    costSubmit.addEventListener('click', handleCostSubmit);
  }
  
  nextButton.addEventListener("click", () => {
    const finalStates = sliderInstances.map(slider => {
      const state = slider.getValue(); 
      return {
        id: slider.container.closest('.category-card').dataset.lifeStyle,
        selected: state.index,
      };
    });

    console.log("다음 버튼 클릭 시 최종 상태:", finalStates);
    store.dispatch({
      type: "SET_EUCLIDEAN",
      payload: { euclideanData: finalStates },
    });

    barba.go("step4.html");
  });

  prevButton.addEventListener('click', () => {
    barba.go('step2.html');
  });
}

async function setupResultEvents() {

  showNotification('', false);

  const state = store.getState();
  const cardSelectWrap = document.querySelector('.select--wrap');
  const resultContainer = document.querySelector('.result--container');
  const resultLoadingContainer = document.querySelector('.result--loaded--container');
  const resultLoadingGuide = document.querySelector('.result--loading--guide');
  const footer = document.querySelector('#footer');
  const reloadButton = document.querySelector('.reload');
  const prevButton = document.querySelector('.prev-button');
  const buttonOptionWrap = document.querySelector('.card--step--option');
  
  const {typeName, genderName, ageGroupName, cost} = state;
  resultContainer.style.display = 'none';
  footer.style.display = 'none';
  buttonOptionWrap.style.display = 'none';
  
  async function updateSelection() {
    const template = `
      <div class="select--item">${typeName}</div>
      <div class="select--item">${genderName}</div>
      <div class="select--item">${ageGroupName}</div>
      ${cost === 0 ? '' :`<div class="select--item">${cost}만원</div>`}
    `;
    cardSelectWrap.innerHTML = template;
    await delay(1000);
    await resultLoader();
  }

  await updateSelection();
  const data = await fetchResultData(state.type, state.gender, state.ageGroup, state.euclideanData);
  await delay(6000);
  
  const lastData = {
    typeName,
    genderName,
    ageGroupName,
    ...data,
  };
  
  if (resultLoadingGuide) resultLoadingGuide.innerHTML = completeMessage();
  
  const contentInner1120 = document.querySelector('.inner_1120');
  const box = document.querySelector('.box');
  const autoResult = setupAutomaticAnimation(contentInner1120, box, resultLoadingContainer, resultContainer, lastData, buttonOptionWrap);
  
  const scrollView = document.querySelector('.kidi--scroll-view');
  if (scrollView) {
      scrollView.style.display = autoResult ? 'none' : 'block';
  }

  prevButton.addEventListener('click', () => {
    barba.go('step3.html');
  });
  reloadButton.addEventListener('click', () => {
    store.dispatch({type: 'RESET_STATE'});
    barba.go('step1.html');
  });
}

function setupAutomaticAnimation(contentInner, box, resultLoadingContainer, resultContainer, lastData, buttonShow) {
  const subVisualHeight = document.querySelector('.sub_visual').clientHeight;
  const headerHeight = document.querySelector('#header').clientHeight;
  const footer = document.querySelector('footer');
  
  const timeline = gsap.timeline({
    onComplete: async () => {
      Transiton.pageLeave();
      setTimeout(async () => {
        Transiton.pageEnter();
        resultLoadingContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = await resultTemplate(lastData);
        await delay(800);
        lenis.scrollTo(subVisualHeight + headerHeight, {
          duration: 0,
          easing: (t) => t,
        });
        footer.style.display = 'block';
        buttonShow.style.display = 'flex';
        setTimeout(() => {
          const counters = document.querySelectorAll(".result--area--info--table--counter");
          counters.forEach((counter, index) => {
            const targetCount = parseInt(counter.dataset.count, 10);
            const sign = index <= 1 ? '+' : '-';
            gsap.to(counter, {
              innerText: targetCount,
              duration: 2,
              ease: "power2.out",
              onUpdate: function() {
                const currentValue = Math.round(this.targets()[0].innerText);
                this.targets()[0].innerText = `${sign}${Math.abs(currentValue)}%`;
              }
            });
          });
        }, 500);
      }, 800);
    }
  });
  
  timeline.to(box, {
    yPercent: 200,
    duration: 0.5,
    ease: "power2.out",
  }, '+=0.5');
  
  return true;
}

function setupPageEvents(namespace) {
  let current;
  switch (namespace) {
    case 'step1':
      current = 0;
      store.dispatch({type: 'SET_CURRENT', payload: current});
      realTimeCurrentState(store.getState().current);
      setupStep1Events();
      scrollToInnerContent();
      break;
    case 'step2':
      current = 1;
      store.dispatch({type: 'SET_CURRENT', payload: current});
      realTimeCurrentState(store.getState().current);
      setupStep2Events();
      scrollToInnerContent();
      break;
    case 'step3':
      current = 2;
      store.dispatch({type: 'SET_CURRENT', payload: current});
      realTimeCurrentState(store.getState().current);
      setupStep3Events();
      scrollToInnerContent();
      break;
    case 'step4':
      current = 3;
      store.dispatch({type: 'SET_CURRENT', payload: current});
      realTimeCurrentState(store.getState().current);
      setupResultEvents();
      scrollToInnerContent();
      break;
    default:
      break;
  }
}

function realTimeCurrentState(current) {
  const currentWrap = document.querySelector('.current--wrap');
  if (!currentWrap) return;
  const currentItem = currentWrap.querySelectorAll('li');
  currentItem.forEach((item, index) => {
    if (index === current) {
      item.classList.add('on');
    } else {
      item.classList.remove('on');
    }
  });
}

export default {
  setupStep1Events,
  setupStep2Events,
  setupStep3Events,
  setupResultEvents,
  setupPageEvents,
  realTimeCurrentState,
};