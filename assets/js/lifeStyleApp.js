import { Transiton, Step } from "./modules/_index.js";
import { store } from "./store/store.js";





/* ------------------------------ Barba 초기화 ------------------------------ */
barba.init({
  sync: true,
  transitions: [
    {
      name: "default-transition",
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


//새로운 페이지가 DOM에 완전히 들어오기 직전에 실행되는 훅
barba.hooks.beforeEnter((data)=>{
  
})


// Barba.js 훅을 사용하여 각 페이지의 이벤트 리스너 연결
barba.hooks.after((data) => {
  Step.setupPageEvents(data.next.namespace);
});

// 초기 로딩 시에도 이벤트 리스너를 연결
document.addEventListener("DOMContentLoaded", () => {
  const initialNamespace = document.querySelector('[data-barba="container"]')?.getAttribute("data-barba-namespace");
  if (initialNamespace) {
    Step.setupPageEvents(initialNamespace);
  }
});
