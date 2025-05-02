const container = document.getElementById("image-container");
const statusElem = document.getElementById("status");
const progressElem = document.querySelector("progress");
// const sectionGallery = container.querySelectorAll(".demo-gallery");
const body = document.querySelector("body");



const createGalleryItems = (item) => {
  const wrapper = document.createElement("ul");
  wrapper.className = "wrapper";
  item.appendChild(wrapper);
  const size = { width: 1240, height: 840 };
  const { width, height } = size;
  const src = `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
  let i = 0;
  const listTemplate = () => {
    return `<li><img width="${width}" height="${height}" src="${src}"></li>`;
  };
  while (i < 4) {
    wrapper.innerHTML += listTemplate();
    i++;
  }
};

function init() {
  console.log("렌더링완료");
  showHero();
}

function showHero() {
  setTimeout(() => {
    document
      .querySelector(".PageTransitionCover_cover__pYL_k")
      .classList.add("off");
  }, 500);
}

// sectionGallery.forEach(createGalleryItems);
const img = gsap.utils.toArray("img");
const loader = document.querySelector(".loader--text");

const updateProgress = (instance) => {
  const progressValue = Math.round(
    (instance.progressedCount * 100) / img.length
  );

  loader.textContent = `${progressValue}%`;

  // progress 설정

  progressElem.setAttribute("value", instance.progressedCount); // 현재 로드된 개수
  console.log(instance.progressedCount);
  progressElem.setAttribute("max", img.length); // 총 개수
  console.log(img.length);
};

function logoAni() {
  const DOM = {
    intro: document.querySelector(".intro"),
    introLogo: document.querySelector(".intro__logo"),
    introTitle: document.querySelector(".intro__content-title"),
  };
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      defaults: {
        ease: "power1.out",
      },
    });
    tl.from(DOM.introLogo, {
      autoAlpha: 0,
      duration: 0.1,
    });
    tl.to(DOM.introTitle, {
      width: "auto",
      duration: 0.5,
      delay: 0.5,
    });
    tl.to(DOM.intro, {
      delay: 0.1,
      autoAlpha: 0,
      duration: 1,
      onComplete: resolve, // 애니메이션 완료 후 Promise 해결
    });
  });
}
body.style.overflow = "hidden";

if (!document.cookie) {
  document.cookie = "visited=true; path=/; max-age=86400"; // 쿠키 설정 (24시간 유효)
  logoAni().then(() => {
    imagesLoaded(img)
      .on("progress", updateProgress) // 진행 상황 추적
      .on("always", init); // 모든 이미지 로드 후 init 실행
  });
}else{
  const introWrap = document.querySelector('.intro--wrap');
  introWrap.style.backgroundColor = 'white'
  if (introWrap) {
    introWrap.remove();
  }
  // scroll();
}


