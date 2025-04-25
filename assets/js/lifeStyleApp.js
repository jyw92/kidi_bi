import {Transiton, Step} from './modules/_index.js';
/* ------------------------------ Barba 초기화 ------------------------------ */
const allowedNamespaces = ['step1', 'step2', 'step3', 'step4']; // 최상단에 선언
let barbaInitialized = true;

document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  console.log(link)
  if (link) {
    const namespace = link.getAttribute('data-barba-namespace');
    if (!namespace || !['step1', 'step2', 'step3', 'step4'].includes(namespace)) {
      event.preventDefault();
      console.log('링크가 비활성화되었습니다:', link.href);
      document.querySelector('[data-barba="wrapper"]').removeAttribute('data-barba');
      if (confirm('정말 나가시겠습니까?')) {
        window.location.href = link.href;
      } else {
        console.log('사용자가 취소했습니다.');
      }
      return;
    }
  }
});

barba.init({
  sync: true,
  views: [
    {
      namespace: 'step1',
      beforeEnter: (data) => {
        setTimeout(() => {
          document.querySelector('.transition').style.display = 'none';
        }, 1000);
      },
    },
    {
      namespace: 'step2',
      beforeEnter: (data) => {
        setTimeout(() => {
          document.querySelector('.transition').style.display = 'none';
        }, 1000);
      },
    },
    {
      namespace: 'step3',
      beforeEnter: (data) => {
        setTimeout(() => {
          document.querySelector('.transition').style.display = 'none';
        }, 1000);
      },
    },
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
        await Transiton.delay(1000);
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

barba.hooks.after((data) => {
  const nextNamespace = data.next.namespace;
  console.log(`현재 네임스페이스: ${nextNamespace}`);
  Step.setupPageEvents(nextNamespace); // 페이지 이벤트 설정
});

barba.hooks.beforeEnter((data) => {
  if (!allowedNamespaces.includes(data.next.namespace)) {
    barba.destroy();
    barbaInitialized = false;
    window.location.href = data.next.url.href;
    return;
  }

  console.log(`Navigating to namespace: ${data.next.namespace}`);
  store.updateCurrentNamespace(data.next.namespace);
});

// 초기 로딩 시 이벤트 리스너 연결 및 step1 리다이렉트 처리
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded 이벤트 발생!');
  const initialNamespace = document.querySelector('[data-barba="container"]')?.getAttribute('data-barba-namespace');

  if (barbaInitialized) {
    if (initialNamespace === 'step2' || initialNamespace === 'step3' || initialNamespace === 'step4') {
      window.location.href = '../user/step1.html';
    } else if (initialNamespace && allowedNamespaces.includes(initialNamespace)) {
      Step.setupPageEvents(initialNamespace); // 그 외 허용된 페이지는 이벤트 설정
    }
  }
});

// 새로고침 또는 페이지를 떠날 때 컨펌 메시지 표시
window.addEventListener('beforeunload', (event) => {
  // Barba.js가 활성화되어 있지 않은 경우에만 컨펌 메시지 표시
  if (barbaInitialized) {
    event.preventDefault();
    event.returnValue = '양식 제출 후에는 수정이 불가능합니다. 정말로 페이지를 나가시겠습니까?'; // Chrome
    return '양식 제출 후에는 수정이 불가능합니다. 정말로 페이지를 나가시겠습니까?'; // Safari 및 기타
  }
});

// window.addEventListener('beforeunload', () => {
//   if (barbaInitialized) {
//     const dataToSend = { test:"test" };
//     navigator.sendBeacon('/api/log-unload', JSON.stringify(dataToSend));
//   }
// });