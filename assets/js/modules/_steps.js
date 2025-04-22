import {store} from '../store/store.js';

/* -------------------------------------------------------------------------- */
/*                                   global                                   */
/* -------------------------------------------------------------------------- */
const IMAGE_PROXY = '../assets/img/lifeStyle/';

function resultLoader() {
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
    const loadingBoxRect = loadingBox.getBoundingClientRect();
    const deltaX = loadingBoxRect.left + loadingBoxRect.width / 2 - (itemRect.left + itemRect.width / 2);

    const targetY = 80; // 물속으로 들어가는 y 값
    const delay = index * 1.0; // 딜레이를 늘려서 더 느리게

    gsap.to(item, {
      x: deltaX,
      y: targetY,
      opacity: 0,
      scale: 0.7,
      duration: animationDuration,
      ease: 'power2.inOut', // 더 부드러운 easing 적용
      delay: delay,
      onStart: () => {
        console.log('onStart 실행됨', index);
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

function delay(n) {
  n = n || 2000;
  return new Promise((done) => {
    setTimeout(() => {
      done();
    }, n);
  });
}

const skeletonConfig = {
  step01: {
    template: () => {
      return ` <div class="image"></div>
          <div class="line--wrap">
            <p class="line"></p>
            <p class="line long"></p>
          </div>
        `;
    },
  },
  step02: {
    template: () => {
      return ` <div class="image"></div>
          <p class="line"></p>
        `;
    },
  },
  step03: {
    template: () => {
      return ` 
          <p class="line"></p>
          <div class="image"></div>
        `;
    },
  },
  step04: {
    template: () => {
      return ` 
          <p class="line"></p>
          <div class="image"></div>
        `;
    },
  },
};

function skeletonUI(step, wrapper, column) {
  const config = skeletonConfig[step];
  let skeleton = '';
  for (let i = 0; i < column; i++) {
    skeleton += `<button class="card skeleton ${step}">
      ${config.template()}
    </button>`;
  }
  wrapper.innerHTML = skeleton;
}

const cardConfig = {
  step01: {
    containerSelector: '.card--container',
    dataAttribute: 'type',
    template: (item) => `
      <img src="${IMAGE_PROXY}${item.image}" alt="">
      <div class="card--info">
        <strong>${item.name}</strong>
        <p>${item.desc}</p>
      </div>
    `,
  },
  step02: {
    containerSelector: '.gender--area .card--container',
    dataAttribute: 'gender',
    template: (item) => `
      <img src="${IMAGE_PROXY}${item.image}" alt="">${item.name}
    `,
  },
  step03: {
    containerSelector: '.age--area .card--container',
    dataAttribute: 'age-group',
    template: (item) => `
      <img src="${IMAGE_PROXY}${item.image}" alt="">${item.name}
    `,
  },
  step04: {
    containerSelector: '.card--container',
    dataAttribute: 'life-style',
    template: (item) => `
      <p>${item.name}</p>
      <img src="${IMAGE_PROXY}${item.image}" alt="">
    `,
  },
};

async function createCards(step, data) {
  const config = cardConfig[step];
  if (!config || !config.containerSelector) {
    console.error(`Configuration for step "${step}" not found.`);
    return;
  }

  const cardContainer = document.querySelector(config.containerSelector);
  if (!cardContainer) {
    console.error(`Container with selector "${config.containerSelector}" not found.`);
    return;
  }

  cardContainer.innerHTML = '';
  cardContainer.innerHTML = data
    .map(
      (item) => `
    <button class="card" data-${config.dataAttribute}="${item.id}">
      ${config.template(item)}
    </button>
  `
    )
    .join('');
}

async function fetchData(url, params = {}) {
  try {
    const response = await axios.get(url, {params});
    return response.data;
  } catch (error) {
    console.error(`데이터를 가져오는 중 오류가 발생했습니다 (${url}):`, error);
    alert(`데이터를 가져오는 중 오류가 발생했습니다.`);
    return [];
  }
}

// 각 단계별 데이터 fetching 함수 (통합된 fetchData 함수 사용)
async function fetchStep01Data() {
  return await fetchData('http://localhost:3000/step1');
}

async function fetchStep02Data() {
  return await fetchData('http://localhost:3000/step2');
}

async function fetchStep03Data(gender) {
  return await fetchData('http://localhost:3000/step3', {gender});
}

async function fetchStep04Data(type, gender, ageGroup) {
  return await fetchData('http://localhost:3000/step4', {type, gender, ageGroup});
}

async function setupStep1Events() {
  const state = store.getState();
  const cardContainer = document.querySelector('.card--container');
  console.log('step01/state', state);

  // skeletonUI("step01", cardContainer, 2)
  // await delay(500);

  const data = await fetchStep01Data();

  cardContainer.innerHTML = '';

  await createCards('step01', data);

  const cards = document.querySelectorAll('[data-barba-namespace="step1"] .card');
  const nextButton = document.querySelector('.next-button');
  let selectedCard = null;

  // 뒤로 가기로 돌아왔을 때 선택 상태 복원
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
      nextButton.style.display = 'flex';
    });
  });

  nextButton.addEventListener('click', () => {
    if (selectedCard) {
      const type = selectedCard.dataset.type;
      store.dispatch({type: 'SET_TYPE', payload: type});
      // incrementCurrent();
      barba.go('step2.html');
    } else {
      alert('카드를 선택해주세요.');
    }
  });
}

async function setupStep2Events() {
  const state = store.getState();
  console.log('step02/state', state);
  const nextButton = document.querySelector('.next-button');
  const prevButton = document.querySelector('.prev-button');
  const cardContainerGender = document.querySelector('.gender--area .card--container');
  const cardContainerAge = document.querySelector('.age--area .card--container');
  const noneAgeData = document.querySelector('.none-data');
  let selectedGender = null;
  let selectedAgeGroup = null;

  // skeletonUI("step02", cardContainerGender, 2)
  // await delay(500);

  const genderData = await fetchStep02Data();
  cardContainerGender.innerHTML = '';
  await createCards('step02', genderData);
  const genderCards = document.querySelectorAll('[data-gender]');

  // 뒤로 가기로 돌아왔을 때 성별 선택 상태 복원 및 연령대 데이터 로드
  if (state.gender) {
    noneAgeData.style.display = 'none';
    genderCards.forEach((card) => {
      if (card.dataset.gender === state.gender) {
        card.classList.add('selected');
        selectedGender = card;
      }
    });

    const ageData = await fetchStep03Data(state.gender);
    cardContainerAge.innerHTML = '';
    noneAgeData.style.display = ageData.length > 0 ? 'none' : 'flex';
    await createCards('step03', ageData);
    attachAgeCardEventListeners(); // 연령대 이벤트 리스너 등록
  } else {
    // 초기 로딩 시 연령대 영역 비워두기
    cardContainerAge.innerHTML = '';
    noneAgeData.style.display = 'flex';
    attachAgeCardEventListeners(); // 연령대 이벤트 리스너 등록 (데이터 없을 때도)
  }

  genderCards.forEach((card) => {
    card.addEventListener('click', async function () {
      if (selectedGender) {
        selectedGender.classList.remove('selected');
      }
      this.classList.add('selected');
      selectedGender = this;
      console.log('selectedGender', selectedGender);

      const ageData = await fetchStep03Data(state.gender);
      cardContainerAge.innerHTML = '';
      noneAgeData.style.display = ageData.length > 0 ? 'none' : 'flex';
      await createCards('step03', ageData);
      attachAgeCardEventListeners(); // 연령대 이벤트 리스너 등록 (성별 클릭 후)
    });
  });

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
        if (selectedGender) {
          // nextButton.style.display = "flex";
        }
      });
    });
  }

  prevButton.addEventListener('click', () => {
    barba.go('step1.html');
  });
  nextButton.addEventListener('click', () => {
    if (selectedGender && selectedAgeGroup) {
      const gender = selectedGender.dataset.gender;
      const ageGroup = selectedAgeGroup.dataset.ageGroup;
      store.dispatch({
        type: 'SET_GENDER_AND_AGE_GROUP',
        payload: {gender, ageGroup},
      });
      barba.go('step3.html');
    } else {
      alert('성별과 연령대를 선택해주세요.');
    }
  });
}

async function setupStep3Events() {
  const state = store.getState();
  const cardContainer = document.querySelector('.card--container');
  console.log('step03/state', state);

  skeletonUI('step03', cardContainer, 20);
  await delay(500);
  const data = await fetchStep04Data(state.type, state.gender, state.ageGroup);
  cardContainer.innerHTML = '';
  await createCards('step04', data);
  const cards = document.querySelectorAll('[data-barba-namespace="step3"] .card');
  const nextButton = document.querySelector('.next-button');
  const prevButton = document.querySelector('.prev-button');
  let selectedLifeCard = null;

  // 뒤로 가기로 돌아왔을 때 선택 상태 복원
  if (state.lifeStyle) {
    cards.forEach((card) => {
      if (card.dataset.lifeStyle === state.lifeStyle) {
        card.classList.add('selected');
        selectedLifeCard = card;
        // nextButton.style.display = "flex";
      }
    });
  }

  cards.forEach((card) => {
    card.addEventListener('click', function () {
      if (selectedLifeCard) {
        selectedLifeCard.classList.remove('selected');
      }
      this.classList.add('selected');
      selectedLifeCard = this;
      // nextButton.style.display = "flex";
    });
  });

  prevButton.addEventListener('click', () => {
    barba.go('step2.html');
  });

  nextButton.addEventListener('click', () => {
    if (selectedLifeCard) {
      const lifeStyle = selectedLifeCard.dataset.lifeStyle;
      store.dispatch({type: 'SET_LIFESTYLE', payload: lifeStyle});
      barba.go('step4.html');
      // incrementCurrent();
    } else {
      alert('라이프스타일을 선택해주세요.');
    }
  });
}

function setupResultEvents() {
  resultLoader();
  const state = store.getState();
  console.log('결과 페이지 상태', state);
  //결과 페이지에 state를 사용하여 결과 표시 로직 구현.
}

function setupPageEvents(namespace) {
  let current;
  switch (namespace) {
    case 'step1':
      current = 0;
      store.dispatch({type: 'SET_CURRENT', payload: current});
      realTimeCurrentState(store.getState().current);
      setupStep1Events();
      break;
    case 'step2':
      current = 1;
      store.dispatch({type: 'SET_CURRENT', payload: current});
      realTimeCurrentState(store.getState().current);
      setupStep2Events();
      break;
    case 'step3':
      current = 2;
      store.dispatch({type: 'SET_CURRENT', payload: current});
      realTimeCurrentState(store.getState().current);
      setupStep3Events();

      break;
    case 'step4':
      current = 3;
      store.dispatch({type: 'SET_CURRENT', payload: current});
      realTimeCurrentState(store.getState().current);
      setupResultEvents();
      break;
    default:
      console.log('알 수 없는 namespace입니다.');
  }
}

function realTimeCurrentState(current) {
  const currentWrap = document.querySelector('.current--wrap');
  const currentItem = currentWrap.querySelectorAll('li');
  currentItem.forEach((item) => {
    item.classList.remove('on');
  });
  currentItem[current].classList.add('on');
}

export default {
  setupStep1Events,
  setupStep2Events,
  setupStep3Events,
  setupResultEvents,
  setupPageEvents,
  realTimeCurrentState,
};
