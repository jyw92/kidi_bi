import { delay } from "./helper/helper.js";
import { animeButtons } from "./components/enter.js";
import Dialog from "./components/dialog.js";
/* -------------------------------------------------------------------------- */
/*                                   global                                   */
/* -------------------------------------------------------------------------- */
const DOM = {
  heroActionTXT : document.querySelector('.hero--action'),
  body:document.querySelector('body'),
  startBtn:document.querySelector('.particles-button'),
  header:document.getElementById('header')
}

gsap.registerPlugin(ScrollTrigger);


//구조분해할당
const { heroActionTXT, body, startBtn, header } = DOM;

async function startAnimation(elm){
  elm.classList.add("appears");
  
}
async function sloganBeforeOverlay(elm){
  elm.classList.add('on');
}

async function heroAnimation(){
  
  let textElements = [...document.querySelectorAll('[data-text-effect]')];

  // text effect
  if (textElements.length > 0) {
    textElements = textElements.map((text) => {
        const { lines, chars, words } = new SplitType(text);
        gsap.set(header, {
          autoAlpha:0,
        })
        gsap.set(startBtn, {
          y:'100%',
        })
        gsap.set(body, {
          overflow: 'hidden',
        });
        gsap.set(lines, {
            overflow: 'hidden',
        });
        gsap.set(chars, {
            y: '100%',
        });
        return { text, chars: chars, words: words };
    });
  }
  await startAnimation(heroActionTXT);
  await delay(2000);
  await sloganBeforeOverlay(heroActionTXT);

  if (textElements) {
    const tl = gsap.timeline();
    
    textElements.forEach((obj) => {
        tl.to(obj.chars, {
            stagger: {
                amount: 0.5,
            },
            y: '0%',
            scrollTrigger: {
                trigger: obj.text,
            },
        },"<")
    });
    tl.to(startBtn,{
      y:'0%',
    },'-=0.5')
    tl.to(header,{
      autoAlpha:1,
      duration:1,
    })
  }
 
}

function dialogEventHandler(){
  const dialog = new Dialog();

  const dialogOpenBtn = document.querySelectorAll('.grid--option');
  dialogOpenBtn.forEach((elm) => {
    elm.addEventListener('click',(e) => {
      const target = e.target;
      if(!target) return;

      const chartType = target.dataset.chartType;
      const chartName = target.dataset.chartName;
      dialog.open({chartType, chartName });
    })
  })
}


function mainApp(){
  
 
  dialogEventHandler();
  heroAnimation();
  animeButtons();
}



mainApp();
