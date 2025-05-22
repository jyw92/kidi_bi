import skeletonUI from '../components/skeletonUI.js';
import resultTemplate from '../modules/_resultTemplate.js';
import createCards from '../components/createCards.js';
import completeMessage from '../components/completeMessage.js';
import scrollToInnerContent from '../components/scrollToInnerContent.js';
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
/*                                   global                                   */
/* -------------------------------------------------------------------------- */

const lenis = new Lenis({
  // 옵션 (선택 사항)
  duration: 1.2, // 스크롤 애니메이션 지속 시간 (초)
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing 함수
  direction: 'vertical', // 스크롤 방향 ('vertical', 'horizontal')
  gestureDirection: 'both', // 제스처 스크롤 방향 ('vertical', 'horizontal', 'both')
  smoothWheel: true, // 마우스 휠 스크롤 부드럽게
  wheelMultiplier: 1,
  smoothTouch: false, // 터치 스크롤 부드럽게
  touchMultiplier: 2,
  infinite: false, // 무한 스크롤
});

// Lenis를 통해 스크롤 이벤트 감지 및 업데이트
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

      // nextButton.style.display = 'flex';
    });
  });
  nextButton.addEventListener('click', () => {
    if (selectedCard) {
      const type = selectedCard.dataset.type;
      const typeName = selectedCard.dataset.typeName;
      store.dispatch({type: 'SET_TYPE', payload: {type, typeName}});
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

    const ageData = await fetchStep03Data(state.genderName);
    cardContainerAge.innerHTML = '';
    noneAgeData.style.display = ageData.length > 0 ? 'none' : 'flex';
    await createCards('step03', ageData);
    attachAgeCardEventListeners(); // 연령대 이벤트 리스너 등록
  } else {
    // 초기 로딩 시 연령대 영역 비워두기
    cardContainerAge.innerHTML = '';
    // noneAgeData.style.display = 'flex';
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
      const genderName = selectedGender.dataset.genderName;
      const ageData = await fetchStep03Data(genderName);
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

// async function setupStep3Events() {
//   const state = store.getState();
//   const cardContainer = document.querySelector(".card--container");
//   console.log("step03/state", state);

//   skeletonUI("step03", cardContainer, 20);
//   await delay(500);
//   const data = await fetchStep04Data(state.type, state.gender, state.ageGroup);
//   cardContainer.innerHTML = "";
//   await createCards("step04", data);

//   const cards = document.querySelectorAll(
//     '[data-barba-namespace="step3"] .card'
//   );
//   const nextButton = document.querySelector(".next-button");
//   const prevButton = document.querySelector(".prev-button");
//   let selectedLifeCard = null;

//   // 뒤로 가기로 돌아왔을 때 선택 상태 복원
//   if (state.lifeStyle) {
//     cards.forEach((card) => {
//       if (card.dataset.lifeStyle === state.lifeStyle) {
//         card.classList.add("selected");
//         selectedLifeCard = card;
//       }
//     });
//   } else {
//     // 초기 로딩 시 선택 상태 초기화
//     cards.forEach((card) => {
//       card.classList.remove("selected");
//     });
//   }

//   cards.forEach((card) => {
//     card.addEventListener("click", function () {
//       if (selectedLifeCard) {
//         selectedLifeCard.classList.remove("selected");
//       }
//       this.classList.add("selected");
//       selectedLifeCard = this;
//       // nextButton.style.display = "flex";
//     });
//   });

//   prevButton.addEventListener("click", () => {
//     barba.go("step2.html");
//   });

//   nextButton.addEventListener("click", () => {
//     if (selectedLifeCard) {
//       const lifeStyle = selectedLifeCard.dataset.lifeStyle;
//       const lifeStyleName = selectedLifeCard.dataset.lifeStyleName;
//       store.dispatch({
//         type: "SET_LIFESTYLE",
//         payload: { lifeStyle, lifeStyleName },
//       });
//       barba.go("step4.html");
//       // incrementCurrent();
//     } else {
//       alert("라이프스타일을 선택해주세요.");
//     }
//   });
// }

async function setupStep3Events() {
  // 선택된 카테고리와 서브카테고리 저장
  let selectedData = [];

  const state = store.getState();
  const restored = state.selectedSubcategories || [];
  const cardContainer = document.querySelector('.card--container');
  console.log('step03/state', state);

  skeletonUI('step03', cardContainer, 6);
  await delay(1000);
  const data = await fetchStep04Data(state.type, state.gender, state.ageGroup);
  cardContainer.innerHTML = '';
  await createCards('step04', data);

  const cards = document.querySelectorAll('[data-barba-namespace="step3"] .category-card');
  const nextButton = document.querySelector('.next-button');
  const prevButton = document.querySelector('.prev-button');
  const selectButton = document.querySelector('.select-button');
  const guidTextBox = document.querySelector('.instruction');
  let selectedLifeCard = null;
  nextButton.style.display = 'none';
  // 뒤로 가기로 돌아왔을 때 선택 상태 복원
  // 뒤로 가기로 돌아왔을 때 선택 상태 복원
  if (state.lifeStyle) {
    cards.forEach((card) => {
      const checkbox = card.querySelector('.category-checkbox');
      const radioButtons = card.querySelectorAll('.subcategory-radio');

      if (checkbox.checked) {
        // 체크박스가 선택되어 있다면 모든 라디오 버튼 활성화
        radioButtons.forEach((radio) => {
          radio.disabled = false;
          const match = restored.find((item) => item.id === radio.dataset.id);
          if (match) {
            radio.checked = true;
            card.classList.add('selected');
            // change 이벤트 수동 발생 (필요 시)
            const event = new Event('change');
            radio.dispatchEvent(event);
          }
        });
      } else {
        // 체크박스가 선택되어 있지 않다면 라디오 버튼 비활성화 (혹시 모를 상태를 대비)
        radioButtons.forEach((radio) => {
          radio.disabled = true;
          radio.checked = false;
        });
        card.classList.remove('selected');
      }
    });
  } else {
    // 초기 로딩 시 선택 상태 초기화
    cards.forEach((card) => {
      card.classList.remove('selected');
    });
  }

  cards.forEach((card, cardIndex) => {
    const header = card.querySelector('.category-header');
    const checkbox = header.querySelector('input[type="checkbox"]');
    const radioButtons = card.querySelectorAll('.subcategory-radio');

    // 카테고리 체크박스 이벤트
    checkbox.addEventListener('change', function () {
      const isChecked = this.checked;

      // 카드 스타일 변경
      if (isChecked) {
        card.classList.add('selected');

        // 라디오 버튼이 하나만 있는 경우 자동으로 체크
        if (radioButtons.length === 1) {
          radioButtons[0].checked = true;

          // change 이벤트 수동 발생 (데이터 저장 등의 로직이 있는 경우를 위해)
          const radioEvent = new Event('change');
          radioButtons[0].dispatchEvent(radioEvent);
        }
      } else {
        card.classList.remove('selected');
        card.classList.remove('error');
        // 카드 선택 해제 시 라디오 버튼도 해제 (선택 사항)
        radioButtons.forEach((radio) => {
          radio.checked = false;
        });
      }

      // 서브카테고리 라디오 버튼 활성화/비활성화
      radioButtons.forEach((radio) => {
        radio.disabled = !isChecked;
      });
    });

    // 헤더 클릭 시 체크박스 토글
    header.addEventListener('click', function (e) {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;

        // change 이벤트 수동 발생
        const event = new Event('change');
        checkbox.dispatchEvent(event);
      }
    });

    // 각 서브카테고리에 이벤트 리스너 추가
    const subcategories = card.querySelectorAll('.subcategory');
    subcategories.forEach((subcategory) => {
      const radio = subcategory.querySelector('.subcategory-radio');
      radio.addEventListener('change', () => {
        const card = radio.closest('.category-card');
        const anyChecked = card.querySelector('.subcategory-radio:checked');
        if (anyChecked) {
          card.classList.remove('error');
        }
      });
      subcategory.addEventListener('click', function (e) {
        if (!radio.disabled && e.target !== radio) {
          radio.checked = !radio.checked; // 토글 가능하게 (선택적)
          const event = new Event('change');
          radio.dispatchEvent(event);
        }
      });
    });
  });
  if (selectedData) {
    selectButton.addEventListener('click', async () => {
      function validateCategoryCards() {
        const selectedCards = document.querySelectorAll('.category-card.selected');
        selectedCards.forEach((card) => {
          const checked = card.querySelector('.subcategory-radio:checked');
          if (!checked) {
            card.classList.add('error');
            return;
          } else {
            card.classList.remove('error');
          }
        });
      }
      validateCategoryCards();

      // 에러가 있으면 진행 차단
      const hasError = document.querySelector('.category-card.error');
      if (hasError) {
        alert('모든 카테고리에서 하나 이상의 앱을 선택해주세요.');
        return;
      }
      selectedData = [];
      const checkedRadios = document.querySelectorAll('.subcategory-radio:checked');
      checkedRadios.forEach((item) => {
        selectedData.push({
          id: item.dataset.id,
          name: item.value,
          image: item.dataset.image,
        });
      });
      store.dispatch({
        type: 'SET_SELECTED_SUBCATEGORIES',
        payload: selectedData,
      });

      if (selectedData.length === 1) {
        selectedLifeCard = checkedRadios[0];
        console.log('selectedLifeCard', selectedLifeCard);
        nextButton.click();
      } else {
        // 카드 렌더링
        skeletonUI('step03', cardContainer, selectedData.length);
        await delay(1000);
        guidTextBox.innerHTML =
          '<p><strong>선택한 목록 중</strong>, 본인의 평소 관심사에 보다 <strong>더 가깝다고 생각하는 앱</strong>을 골라주세요.</p>';
        const selectTemplate = selectedData
          .map((item) => {
            return `<button class="card" data-life-style="${item.id}" data-life-style-name="${item.name}">
            <p>${item.name}</p>
            <img src="../assets/img/lifeStyle/${item.image}" alt="${item.name}">
            <span class="card__body-cover-checkbox">
              <svg class="card__body-cover-checkbox--svg" viewBox="0 0 12 10">
                <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
              </svg>
            </span>
          </button>`;
          })
          .join('');

        cardContainer.innerHTML = selectTemplate;
        selectButton.style.display = 'none';
        nextButton.style.display = 'flex';
        const lastCards = document.querySelectorAll('[data-barba-namespace="step3"] .card');
        lastCards.forEach((card) => {
          card.addEventListener('click', function () {
            if (selectedLifeCard) selectedLifeCard.classList.remove('selected');
            this.classList.add('selected');
            selectedLifeCard = this;
          });
        });
      }
    });
  }
  prevButton.addEventListener('click', () => {
    barba.go('step2.html');
  });

  nextButton.addEventListener('click', () => {
    if (selectedLifeCard) {
      const lifeStyle = selectedLifeCard.dataset.lifeStyle;
      const lifeStyleName = selectedLifeCard.dataset.lifeStyleName;
      store.dispatch({
        type: 'SET_LIFESTYLE',
        payload: {lifeStyle, lifeStyleName},
      });
      barba.go('step4.html');
      // incrementCurrent();
    } else {
      alert('라이프스타일을 선택해주세요.');
    }
  });
}

async function setupResultEvents() {
  const state = store.getState();
  console.log('결과 페이지 상태', state);
  //결과 페이지에 state를 사용하여 결과 표시 로직 구현.

  const cardSelectWrap = document.querySelector('.select--wrap');
  const resultContainer = document.querySelector('.result--container');
  const resultLoadingContainer = document.querySelector('.result--loaded--container');
  const resultLoadingGuide = document.querySelector('.result--loading--guide');
  const contentInner1120 = document.querySelector('.inner_1120');
  const box = document.querySelector('.box');
  const footer = document.querySelector('#footer');
  const reloadButton = document.querySelector('.reload');
  const prevButton = document.querySelector('.prev-button');

  const {typeName, genderName, ageGroupName, lifeStyleName} = state;
  resultContainer.style.display = 'none';
  footer.style.display = 'none';
  const buttonOptionWrap = document.querySelector('.card--step--option');
  buttonOptionWrap.style.display = 'none';
  async function updateSelection() {
    const template = `
      <div class="select--item">${typeName}</div>
      <div class="select--item">${genderName}</div>
      <div class="select--item">${ageGroupName}</div>
      <div class="select--item">${lifeStyleName}</div>
    `;
    cardSelectWrap.innerHTML = template;
    await delay(1000);
    await resultLoader();
  }

  updateSelection();
  const data = await fetchResultData(state.type, state.gender, state.ageGroup, state.lifeStyle);
  await delay(6000);
  const lastData = {
    typeName,
    genderName,
    ageGroupName,
    lifeStyleName,
    ...data,
  };
  resultLoadingGuide.innerHTML = completeMessage();

  
  
  const autoResult = setupAutomaticAnimation(contentInner1120, box, resultLoadingContainer, resultContainer, lastData, buttonOptionWrap)

  if(autoResult){
    //스크롤 아이콘제거
    document.querySelector('.kidi--scroll-view').style.display = 'none';
  }else{
    document.querySelector('.kidi--scroll-view').style.display = 'block';
  }


  prevButton.addEventListener('click', () => {
    barba.go('step3.html');
  });
  reloadButton.addEventListener('click', () => {
    store.dispatch({type: 'RESET_STATE'});
    barba.go('step1.html');
  });
}

function setupScrollAnimation(contentInner, box, resultLoadingContainer, resultContainer, lastData, buttonShow) {
  const subVisualHeight = document.querySelector('.sub_visual').clientHeight;
  const headerHeight = document.querySelector('#header').clientHeight;
  // const body = document.querySelector('body');
  ScrollTrigger.create({
    id: 'main-vis',
    trigger: contentInner,
    start: 'top top',
    end: '+=100%',
    pin: true,
    // pinSpacing: false,
    // invalidateOnRefresh: true,
    // anticipatePin: 1,
    // markers: true,
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: contentInner,
        start: 'top top',
        end: '+=100',
        scrub: 1,
        id: 'main-ani',
        onLeave: () => {
          Transiton.pageLeave();
          // lenis.stop();
          // document.body.style.overflow = 'hidden';
          setTimeout(async () => {
            Transiton.pageEnter();
            resultLoadingContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            resultContainer.innerHTML = await resultTemplate(lastData);
            const counters = document.querySelectorAll(".result--area--info--table--counter");
           
            


            await delay(800);
            lenis.scrollTo(subVisualHeight + headerHeight, {
              duration: 0, // 즉시 이동
              easing: (t) => t, // 선형 이동
            });
            lenis.scrollTo(subVisualHeight + headerHeight);
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


            // body.style.overflow = 'auto';
            footer.style.display = 'block';
            buttonShow.style.display = 'flex';
            // lenis.start();
            // document.body.style.overflow = 'auto';
            //gsap 종료
            ScrollTrigger.getById('main-ani')?.kill();
            ScrollTrigger.getById('main-vis')?.kill();
          }, 800);
        },
      },
    })
    .to(box, {
      yPercent: 200,
      duration: 2,
      ease: 'none', // 부드러운 효과로 자연스러운 표현
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
  },'+=0.5');
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
