export default function scrollToInnerContent() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  const innerContent = document.querySelector('.inner_1120');
  if (innerContent) {
    const offsetTop = innerContent.offsetTop;
    console.log("offsetTop", offsetTop);
    // window.scrollTo({
    //   top: offsetTop,
    //   behavior: 'smooth',
    // });
    lenis.scrollTo(offsetTop, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Lenis easing function
      //duration: 0, // 즉시 이동
      // easing: (t) => t, // 선형 이동
    });
  }
}