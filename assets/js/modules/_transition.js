/* -------------------------------------------------------------------------- */
/*                                Global State                                */
/* -------------------------------------------------------------------------- */

const TRANSPARENT_COLOR = 'transparent';
const tranElement = document.querySelector('.transition');
const tranDOM = {
  screen: tranElement.querySelector('.transition__screen'),
  background: tranElement.querySelector('.transition__background'),
  svg: tranElement.querySelector('.transition__background svg'),
  path: tranElement.querySelector('.transition__background path'),
  barbaContainer: document.querySelector('#barba-wrapper'),
  cardContainer: document.querySelectorAll('.card--container'),
  cardItem:document.querySelectorAll('.card')
};

/* -------------------------------- transiton ------------------------------- */
function calcWinDirection() {
  if (window.innerWidth > window.innerHeight) {
    console.log('resize');
    gsap.set(tranDOM.background, {
      width: '100%', //100vw 에서 100%로 수정정
      height: 'auto',
    });
  } else {
    gsap.set(tranDOM.background, {
      width: 'auto',
      height: '100vh',
    });
  }
}

window.addEventListener('resize', () => {
  calcWinDirection();
});
calcWinDirection();

const enterQ = 25;
const leaveQ = 75;

const d = [
  'M0,100 V100 Q100,100 100,100 V100 Q100,100 0,100 z',
  `M0,100, V50 Q50,${enterQ} 100,50 V100 Q50,100 0,100 z`,
  'M0,0 V0 Q50,0 100,0 V100 Q50,100 0,100 z',
  `M0,0 V0 Q50,0 100,0 V50 Q50,${leaveQ} 0,50 z`,
  'M0,0 V0 Q50,0 100,0 V0 Q50,0 0,0 z',
];
function getPathScene(i) {
  tranDOM.background.setAttribute('data-scene', i);
  const ease = i % 2 === 0 ? 'power3.out' : 'power3.in';
  return {
    attr: {d: d[i]},
    ease: ease,
  };
}

function resetTransitionPath() {
  gsap.set(tranDOM.path, getPathScene(0));
}

function inTransition() {
  document.documentElement.classList.add('is-transitioning');
}
function outTransition() {
  document.documentElement.classList.remove('is-transitioning');
  setTimeout(() => {
    gsap.set('.transition__background path', {
      fill: '#2D83F3',
    });
  }, 2000);
}

function pageLeave() {
  // alert('leave')
  inTransition();
  gsap.timeline().to(tranDOM.path, getPathScene(1)).to(tranDOM.path, getPathScene(2));
  gsap.to(tranDOM.barbaContainer, {
    duration: 1,
    autoAlpha: 0.2,
    ease: 'power1.inOut',
  });
  
}

function pageEnter() {
  // alert('enter')
  outTransition();
  gsap.to(tranDOM.barbaContainer, {
    duration: 1,
    autoAlpha: 1,
    ease: 'power1.inOut',
  });
  gsap
    .timeline()
    .to(tranDOM.path, getPathScene(3))
    .to(tranDOM.path, getPathScene(4))
    .call(() => {
      resetTransitionPath();
    });
}

function pageOnce() {
  // alert('once')
  inTransition();
  gsap.set(tranDOM.screen, {
    backgroundColor: TRANSPARENT_COLOR,
  });
  pageEnter();
}

function delay(n) {
  n = n || 2000;
  return new Promise((done) => {
    setTimeout(() => {
      done();
    }, n);
  });
}

export default {
  pageLeave,
  pageEnter,
  pageOnce,
  delay,
};
