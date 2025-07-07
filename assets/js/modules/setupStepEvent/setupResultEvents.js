import completeMessage from "../../components/completeMessage.js";
import { fetchResultData } from "../../components/fetchData.js";
import { store } from "../../store/store.js";
import showNotification from '../setupStepHelper/showNotification.js';
import { delay } from "../../helper/helper.js";
import { Transiton } from "../_index.js";
import resultTemplate from "../_resultTemplate.js";

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "both",
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
  const cnt = document.getElementById("count");
  const water = document.getElementById("water");
  const items = document.querySelectorAll(".select--item");
  const loadingBox = document.querySelector(".result--loading");
  let percent = 0;
  const animationDuration = 1.2; // 더 부드러운 애니메이션을 위해 속도 조절
  const totalItems = items.length;
  const percentIncrement = 100 / totalItems; // 각 아이템당 증가할 퍼센트

  gsap.set(water, { transform: "translateY(100%)" });

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
      ease: "power2.inOut", // 더 부드러운 easing 적용
      delay: delay,
      onStart: () => {
        console.log("onStart 실행됨", index);
      },
      onUpdate: () => {
        // 애니메이션 진행 중에도 퍼센트와 물 높이를 업데이트
        const progress = gsap.getProperty(item, "progress");
        const currentPercent = Math.min(
          percent + percentIncrement * progress,
          100
        );
        animatePercentage(
          cnt,
          parseInt(cnt.innerText) || 0,
          Math.round(currentPercent),
          0.6
        );
        gsap.to(water, {
          y: `${100 - currentPercent}%`,
          duration: 0.6,
          ease: "power1.out",
        });
      },
      onComplete: () => {
        percent += percentIncrement;
        if (percent > 100) percent = 100;
        animatePercentage(
          cnt,
          parseInt(cnt.innerText) || 0,
          Math.round(percent),
          0.6
        ); // 부드러운 퍼센트 증가
        gsap.to(water, {
          y: `${100 - percent}%`,
          duration: 0.6, // 물 애니메이션 속도 조정
          ease: "power1.out", // 더 자연스러운 easing 적용
        });

        if (index === totalItems - 1) {
          animatePercentage(cnt, parseInt(cnt.innerText) || 0, 100, 0.6);
          gsap.to(water, { y: `0%`, duration: 0.6, ease: "power1.out" });
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
    const dots = document.getElementById("dots");
    let dotCount = 0;
    setInterval(() => {
      dots.textContent = ".".repeat(dotCount);
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
    if (
      (increment > 0 && current >= end) ||
      (increment < 0 && current <= end)
    ) {
      current = end;
    }
    target.innerText = Math.round(current);

    if (current !== end) {
      requestAnimationFrame(step);
    }
  }

  step();
}

function setupAutomaticAnimation(
  contentInner,
  box,
  resultLoadingContainer,
  resultContainer,
  lastData,
  buttonShow
) {
  const subVisualHeight = document.querySelector(".sub_visual").clientHeight;
  const headerHeight = document.querySelector("#header").clientHeight;
  const footer = document.querySelector("footer");

  const timeline = gsap.timeline({
    onComplete: async () => {
      Transiton.pageLeave();
      setTimeout(async () => {
        Transiton.pageEnter();
        resultLoadingContainer.style.display = "none";
        resultContainer.style.display = "block";
        resultContainer.innerHTML = await resultTemplate(lastData);
        await delay(800);
        lenis.scrollTo(subVisualHeight + headerHeight, {
          duration: 0,
          easing: (t) => t,
        });
        footer.style.display = "block";
        buttonShow.style.display = "flex";
        setTimeout(() => {
          const counters = document.querySelectorAll(
            ".result--area--info--table--counter"
          );
          counters.forEach((counter, index) => {
            const targetCount = parseInt(counter.dataset.count, 10);
            const sign = index <= 1 ? "+" : "-";
            gsap.to(counter, {
              innerText: targetCount,
              duration: 2,
              ease: "power2.out",
              onUpdate: function () {
                const currentValue = Math.round(this.targets()[0].innerText);
                this.targets()[0].innerText = `${sign}${Math.abs(
                  currentValue
                )}%`;
              },
            });
          });
        }, 500);
      }, 800);
    },
  });

  timeline.to(
    box,
    {
      yPercent: 200,
      duration: 0.5,
      ease: "power2.out",
    },
    "+=0.5"
  );

  return true;
}

async function setupResultEvents() {
  showNotification("", false);

  const state = store.getState();
  const cardSelectWrap = document.querySelector(".select--wrap");
  const resultContainer = document.querySelector(".result--container");
  const resultLoadingContainer = document.querySelector(
    ".result--loaded--container"
  );
  const resultLoadingGuide = document.querySelector(".result--loading--guide");
  const footer = document.querySelector("#footer");
  const reloadButton = document.querySelector(".reload");
  const prevButton = document.querySelector(".prev-button");
  const buttonOptionWrap = document.querySelector(".card--step--option");

  const { typeName, genderName, ageGroupName, cost } = state;
  resultContainer.style.display = "none";
  footer.style.display = "none";
  buttonOptionWrap.style.display = "none";

  async function updateSelection() {
    const template = `
      <div class="select--item">${typeName}</div>
      <div class="select--item">${genderName}</div>
      <div class="select--item">${ageGroupName}</div>
      ${cost === 0 ? "" : `<div class="select--item">${cost}만원</div>`}
    `;
    cardSelectWrap.innerHTML = template;
    await delay(1000);
    await resultLoader();
  }

  await updateSelection();
  const data = await fetchResultData(
    state.type,
    state.gender,
    state.ageGroup,
    state.euclideanData
  );
  await delay(6000);

  const lastData = {
    typeName,
    genderName,
    ageGroupName,
    ...data,
  };

  if (resultLoadingGuide) resultLoadingGuide.innerHTML = completeMessage();

  const contentInner1120 = document.querySelector(".inner_1120");
  const box = document.querySelector(".box");
  const autoResult = setupAutomaticAnimation(
    contentInner1120,
    box,
    resultLoadingContainer,
    resultContainer,
    lastData,
    buttonOptionWrap
  );

  const scrollView = document.querySelector(".kidi--scroll-view");
  if (scrollView) {
    scrollView.style.display = autoResult ? "none" : "block";
  }

  prevButton.addEventListener("click", () => {
    barba.go("step3.html");
  });
  reloadButton.addEventListener("click", () => {
    store.dispatch({ type: "RESET_STATE" });
    barba.go("step1.html");
  });
}

export default setupResultEvents;
