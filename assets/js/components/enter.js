import { Overlay } from "./overlay.js";
import { delay } from "../helper/helper.js";

async function requestOnComplete(elm) {
  //server요청완료되면
  //delay는 임시로 작성
  //axios or ajax로 호출완료하면 grid change
  await delay(500);

  /* ------------------------------- server code ------------------------------ */
  //여기에 서버요청 완료되면 아래코드 적용
  // elm.classList.remove('grid--columns')
  elm.classList.add("change");
  elm.style.pointerEvents = "auto";
}

const animateSecondGrid = () => {
  const grid = document.querySelector("[data-grid-second]");
  const gridImages = grid.querySelectorAll(".grid--item");
  const middleIndex = Math.floor(gridImages.length / 2);
  grid.style.pointerEvents = "none";
  gsap
    .timeline({
      defaults: {
        ease: "power3",
        duration: 1,
      },
      onComplete: () => {
        requestOnComplete(grid);
      },
    })
    .from(
      gridImages,
      {
        stagger: {
          amount: 0.6,
          from: "center",
        },
        y: window.innerHeight,
        transformOrigin: "50% 0%",
        rotation: (pos) => {
          const distanceFromCenter = Math.abs(pos - middleIndex);
          return pos < middleIndex
            ? distanceFromCenter * 3
            : distanceFromCenter * -3;
        },
      },
      "+=0.5"
    );
};

const animateSixthGrid = async () => {
  const contentMainInfo = document.querySelector(".content--main");
  const grid = document.querySelector("[data-grid-sixth]");
  const gridItems = grid.querySelectorAll(".grid__item");

  gsap.set(grid, { autoAlpha: 0 });
  await delay(1000);
  contentMainInfo.classList.add("on");
  gsap
    .timeline({
      defaults: {
        ease: "none",
      },
      onComplete: () => {
        requestOnComplete(grid);
      },
    })
    .to(grid, {
      autoAlpha: 1,
    })
    .from(gridItems, {
      stagger: {
        amount: 0.03,
        from: "edges",
        grid: [3, 3],
      },
      scale: 0.7,
      autoAlpha: 0,
    })
    .from(
      grid,
      {
        scale: 0.7,
        skewY: 5,
      },
      0
    );
};

async function pageTransition() {
  // 인트로
  const intro = document.querySelector(".hero--intro");

  // 컨텐츠 요소들
  const contentElements = document.querySelector(".content--wrap");
  const contentMain = document.querySelector(".content--main");
  const grid = document.querySelector("[data-grid-second]");
  // DOM에서 오버레이 요소를 선택합니다.
  const overlayEl = document.querySelector(".overlay");

  // 선택된 오버레이 요소를 사용하여 Overlay 객체를 인스턴스화합니다.
  const overlay = new Overlay(overlayEl, {
    rows: 9,
    columns: 17,
  });
  let isAnimating = false;

  if (isAnimating) return;
  await delay(1000);
  isAnimating = true;
  overlay
    .show({
      // 각 셀 애니메이션의 지속 시간
      duration: 0.25,
      // 각 셀 애니메이션의 easing
      ease: "power1.in",
      // Stagger 객체
      stagger: {
        grid: [overlay.options.rows, overlay.options.columns],
        from: "center",
        each: 0.025,
      },
    })
    .then(async () => {
      // 컨텐츠 표시
      if (intro) {
        intro.classList.add("intro--closed");
        gsap.set(intro, {
          position: "fixed",
          y: "-100%",
        });
      }
      if (contentElements) {
        contentElements.classList.add("content--open");
        contentMain.classList.add("on");
        gsap.set(contentElements, {
          position: "static",
          y: "0",
          onComplete: () => requestOnComplete(grid),
        });

        // animateSixthGrid();
        // animateSecondGrid();
        
        // 스크롤 활성화
        // scroll();
      }

      // 이제 오버레이를 숨깁니다.
      overlay
        .hide({
          // 각 셀 애니메이션의 지속 시간
          duration: 0.25,
          // 각 셀 애니메이션의 easing
          ease: "power1",
          // Stagger 객체
          stagger: {
            grid: [overlay.options.rows, overlay.options.columns],
            from: "center",
            each: 0.025,
          },
        })
        .then(async () => {
          isAnimating = false;
        });
    });
}

function animeButtons() {
  const arrOpts = [
    {},
    {
      type: "triangle",
      easing: "easeOutQuart",
      size: 6,
      particlesAmountCoefficient: 4,
      oscillationCoefficient: 2,
      color: function () {
        return Math.random() < 0.5 ? "#000000" : "#ffffff";
      },
    },
    {
      type: "rectangle",
      duration: 500,
      easing: "easeOutQuad",
      color: "#091388",
      direction: "top",
      size: 8,
    },
    {
      direction: "right",
      size: 4,
      speed: 1,
      color: "#e85577",
      particlesAmountCoefficient: 1.5,
      oscillationCoefficient: 1,
    },
    {
      duration: 1300,
      easing: "easeInExpo",
      size: 3,
      speed: 1,
      particlesAmountCoefficient: 10,
      oscillationCoefficient: 1,
    },
    {
      direction: "bottom",
      duration: 1000,
      easing: "easeInExpo",
    },
    {
      type: "rectangle",
      style: "stroke",
      size: 15,
      color: "#e87084",
      duration: 600,
      easing: [0.2, 1, 0.7, 1],
      oscillationCoefficient: 5,
      particlesAmountCoefficient: 2,
      direction: "right",
    },
    {
      type: "triangle",
      style: "stroke",
      direction: "top",
      size: 5,
      color: "blue",
      duration: 1400,
      speed: 1.5,
      oscillationCoefficient: 15,
      direction: "right",
    },
    {
      duration: 500,
      easing: "easeOutQuad",
      speed: 0.1,
      particlesAmountCoefficient: 10,
      oscillationCoefficient: 80,
    },
    {
      direction: "right",
      size: 4,
      color: "#969696",
      duration: 1200,
      easing: "easeInCubic",
      particlesAmountCoefficient: 8,
      speed: 0.4,
      oscillationCoefficient: 1,
    },
    {
      style: "stroke",
      color: "#1b81ea",
      direction: "bottom",
      duration: 1200,
      easing: "easeOutSine",
      speed: 0.7,
      oscillationCoefficient: 5,
    },
    {
      type: "triangle",
      easing: "easeOutSine",
      size: 3,
      duration: 800,
      particlesAmountCoefficient: 7,
      speed: 3,
      oscillationCoefficient: 1,
    },
  ];

  const items = document.querySelectorAll(".grid__item");
  items.forEach((el, pos) => {
    const bttn = el.querySelector("button.particles-button");
    let particlesOpts = arrOpts[pos];
    const particles = new Particles(bttn, particlesOpts);

    let buttonVisible = true;
    bttn.addEventListener("click", () => {
      bttn.style.pointerEvents = "none";
      if (!particles.isAnimating() && buttonVisible) {
        particles.disintegrate();
        buttonVisible = !buttonVisible;
      }
      
      pageTransition();
    });
  });
}

export { animeButtons };
