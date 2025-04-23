import {Transiton, Step} from './modules/_index.js';
import {store} from './store/store.js';

/* ------------------------------ Barba 초기화 ------------------------------ */

barba.init({
  sync: true,
  views: [
    {
      namespace: 'step4',
      beforeEnter: (data) => {
        setTimeout(() => {
          document.querySelector('.transition').style.display = 'block';
        }, 1000);
      },
    },
  ],
  transitions: [
    {
      name: 'default-transition',
      async leave(data) {
        const done = this.async();
        Transiton.pageLeave(data);
        await Transiton.delay(500);
        done();
      },
      async enter(data) {
        Transiton.pageEnter(data);
      },
      async once(data) {
        Transiton.pageOnce(data);
      },
    },
  ],
});

// 새로운 페이지가 DOM에 완전히 들어오기 직전에 실행되는 훅
barba.hooks.beforeEnter((data) => {});

// Barba.js 훅을 사용하여 각 페이지의 이벤트 리스너 연결
barba.hooks.after((data) => {
  Step.setupPageEvents(data.next.namespace);
});

// 초기 로딩 시에도 이벤트 리스너를 연결하고, 새로고침 시 step1.html로 이동 (확인 메시지 추가)
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded 이벤트 발생!');
  const initialNamespace = document.querySelector('[data-barba="container"]')?.getAttribute('data-barba-namespace');
  if (initialNamespace) {
    Step.setupPageEvents(initialNamespace);
  }

  window.addEventListener('beforeunload', (event) => {
    // 현재 페이지가 step1.html이 아닌 경우에만 확인 메시지 표시
    if (window.location.pathname.indexOf('step1.html') === -1) {
      event.preventDefault();
      event.returnValue = '정말로 새로고침하여 step1 페이지로 이동하시겠습니까?'; // 브라우저에 따라 메시지가 다르게 표시될 수 있습니다.
    }
  });

  // 페이지 로드 시 현재 페이지가 step1.html이 아니면 리다이렉트 (최초 로딩 시에만 적용)
  if (sessionStorage.getItem('reloaded') !== 'true' && window.location.pathname.indexOf('step1.html') === -1) {
    console.log('최초 로딩 감지, step1.html로 리다이렉트 시도...');
    window.location.href = './step1.html';
    sessionStorage.setItem('reloaded', 'true'); // 리다이렉트 후 세션 스토리지에 플래그 설정
  } else if (window.location.pathname.indexOf('step1.html') !== -1) {
    sessionStorage.removeItem('reloaded'); // step1.html에 도착하면 플래그 제거
    console.log('현재 페이지는 step1.html 입니다.');
  }
});
