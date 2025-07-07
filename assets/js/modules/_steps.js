
import scrollToInnerContent from "../components/scrollToInnerContent.js";
import { store } from "../store/store.js";
import setupStep1Events from "./setupStepEvent/setupStep1Events.js";
import setupStep2Events from "./setupStepEvent/setupStep2Events.js";
import setupStep3Events from "./setupStepEvent/setupStep3Events.js";
import setupResultEvents from "./setupStepEvent/setupResultEvents.js";

gsap.registerPlugin(ScrollTrigger);



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

function setupPageEvents(namespace) {
  let current;
  switch (namespace) {
    case "step1":
      current = 0;
      store.dispatch({ type: "SET_CURRENT", payload: current });
      realTimeCurrentState(store.getState().current);
      setupStep1Events();
      scrollToInnerContent();
      break;
    case "step2":
      current = 1;
      store.dispatch({ type: "SET_CURRENT", payload: current });
      realTimeCurrentState(store.getState().current);
      setupStep2Events();
      scrollToInnerContent();
      break;
    case "step3":
      current = 2;
      store.dispatch({ type: "SET_CURRENT", payload: current });
      realTimeCurrentState(store.getState().current);
      setupStep3Events();
      scrollToInnerContent();
      break;
    case "step4":
      current = 3;
      store.dispatch({ type: "SET_CURRENT", payload: current });
      realTimeCurrentState(store.getState().current);
      setupResultEvents();
      scrollToInnerContent();
      break;
    default:
      break;
  }
}

function realTimeCurrentState(current) {
  const currentWrap = document.querySelector(".current--wrap");
  if (!currentWrap) return;
  const currentItem = currentWrap.querySelectorAll("li");
  currentItem.forEach((item, index) => {
    if (index === current) {
      item.classList.add("on");
    } else {
      item.classList.remove("on");
    }
  });
}

export default {  setupPageEvents, realTimeCurrentState };
 
  

