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
// body.style.overflow = "hidden";

document.addEventListener('DOMContentLoaded', function() {
  const introWrap = document.querySelector('.intro--wrap');
  // 여기에 전체 코드 넣기
  if (!document.cookie || document.cookie.indexOf('visited=') === -1) { // visited 쿠키가 없을 때로 좀 더 명확하게
    introWrap.style.opacity = '1'; // 인트로 랩의 opacity를 1로 설정
    document.cookie = "visited=true; path=/; max-age=" + 60 * 60 * 24 + "; SameSite=Lax"; // 쿠키 설정 (24시간 유효), SameSite 추가 고려
    console.log("쿠키 없음, 애니메이션 실행 시도"); // 디버깅 로그

    // img 변수가 여기서 올바르게 할당되는지 확인
    // 예: const img = document.querySelectorAll('.preload-images img');
    // console.log(img);

    if (typeof logoAni !== 'function') {
      console.error('logoAni 함수가 정의되지 않았습니다.');
      return;
    }
    if (typeof imagesLoaded !== 'function') {
      console.error('imagesLoaded 함수가 정의되지 않았습니다.');
      return;
    }
    // img 변수도 여기서 확인 필요
    if (!img || (img.length === 0 && !(img instanceof Element))) {
         console.error('img 변수가 유효하지 않습니다.');
         // return; // 또는 img 없이 처리할 로직
    }

    logoAni().then(() => {
      console.log("logoAni 완료, imagesLoaded 실행"); // 디버깅 로그
      imagesLoaded(img)
        .on("progress", function(instance, image) {
          // updateProgress 함수가 잘 호출되는지 확인
          console.log('Image loaded: ', image.img.src);
          if (typeof updateProgress === 'function') {
            updateProgress(instance, image);
          } else {
            console.error('updateProgress 함수가 정의되지 않았습니다.');
          }
        })
        .on("always", function(instance) {
          console.log("모든 이미지 로드 완료, init 실행"); // 디버깅 로그
          if (typeof init === 'function') {
            init(instance);
          } else {
            console.error('init 함수가 정의되지 않았습니다.');
          }
        })
        .on("fail", function(instance) {
          console.error('하나 이상의 이미지 로드 실패:', instance);
        });
    }).catch(error => {
      console.error("logoAni Promise 에러:", error);
    });

  } else {
    console.log("쿠키 있음, 인트로 제거 시도"); // 디버깅 로그
    if (introWrap) {
      introWrap.style.backgroundColor = 'white'; // 이 줄은 introWrap.remove() 전에 실행될 필요는 없어보입니다.
      introWrap.remove();
      console.log("인트로 제거 완료");
    } else {
      console.log("제거할 .intro--wrap 없음");
    }
  }
});


