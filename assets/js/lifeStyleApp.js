import {Transiton, Step} from './modules/_index.js';
/* ------------------------------ Barba 초기화 ------------------------------ */
const allowedNamespaces = ['step1', 'step2', 'step3', 'step4']; // 최상단에 선언
let barbaInitialized = true;

//라이프스타일을 제외한 메인, 서브페이지등등 페이지이동할때 안전하게 barba탈출
//아래코드적용안할시, 다시 라이프스타일 step1로 이동하게됨.
// 페이지의 모든 'click' 이벤트를 감지합니다.
document.addEventListener('click', (event) => {
  // 1. 클릭된 요소에서 가장 가까운 <a> 태그를 찾습니다.
  const link = event.target.closest('a');

  // 2. <a> 태그를 찾은 경우에만 아래 로직을 실행합니다. (이것이 null 오류를 방지합니다.)
  if (link) {
    const namespace = link.getAttribute('data-barba-namespace');
    const allowedNamespaces = ['step1', 'step2', 'step3', 'step4'];

    // 3. 클릭한 링크가 Barba.js로 제어되는 페이지(step1~4)가 아닌 경우
    if (!namespace || !allowedNamespaces.includes(namespace)) {
      event.preventDefault(); // 기본 링크 이동을 즉시 막습니다.
      console.log('Barba 제어 외부 링크 클릭됨:', link.href);

      // Barba의 제어 속성을 제거하고, 페이지를 떠날지 사용자에게 확인합니다.
      document.querySelector('[data-barba="wrapper"]').removeAttribute('data-barba');
      if (confirm('정말 페이지를 벗어나시겠습니까?')) {
        window.location.href = link.href; // "확인"을 누르면 해당 링크로 이동합니다.
      } else {
        console.log('페이지 이동을 취소했습니다.');
      }
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

//강제로 상태값 추가할 수 있음 참고사항
window.addEventListener('beforeunload', () => {
  if (barbaInitialized) {
    const dataToSend = {test: 'test'};
    navigator.sendBeacon('/api/log-unload', JSON.stringify(dataToSend));
  }
});
