import resultTemplate from '../modules/_resultTemplate.js';
import {Transiton} from './_index.js';
export default function setupScrollAnimation(contentInner, box, resultLoadingContainer, resultContainer, lastData, buttonShow) {
    const subVisualHeight = document.querySelector('.sub_visual').clientHeight;
    const headerHeight = document.querySelector('#header').clientHeight;
    // const body = document.querySelector('body');
    ScrollTrigger.create({
      id: 'main-vis',
      trigger: contentInner,
      start: 'top top',
      end: '+=100%',
      pin: true,
      // pinSpacing: false,
      // invalidateOnRefresh: true,
      // anticipatePin: 1,
      // markers: true,
    });
  
    gsap
      .timeline({
        scrollTrigger: {
          trigger: contentInner,
          start: 'top top',
          end: '+=100',
          scrub: 1,
          id: 'main-ani',
          onLeave: () => {
            Transiton.pageLeave();
            // lenis.stop();
            // document.body.style.overflow = 'hidden';
            setTimeout(async () => {
              Transiton.pageEnter();
              resultLoadingContainer.style.display = 'none';
              resultContainer.style.display = 'block';
              resultContainer.innerHTML = resultTemplate(lastData);
              await delay(800);
              lenis.scrollTo(subVisualHeight + headerHeight, {
                duration: 0, // 즉시 이동
                easing: (t) => t, // 선형 이동
              });
              lenis.scrollTo(subVisualHeight + headerHeight);
              // body.style.overflow = 'auto';
              footer.style.display = 'block';
              buttonShow.style.display = 'flex';
              // lenis.start();
              // document.body.style.overflow = 'auto';
              //gsap 종료
              ScrollTrigger.getById('main-ani')?.kill();
              ScrollTrigger.getById('main-vis')?.kill();
            }, 800);
            
          },
        },
      })
      .to(box, {
        yPercent: 200,
        duration: 2,
        ease: 'none', // 부드러운 효과로 자연스러운 표현
      });
      
  }