import Lenis from '@studio-freight/lenis';

const lenis = new Lenis({
    duration: 1.2, // Smooth scroll duration
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
    direction: 'vertical', // 'vertical' ya 'horizontal'
    smooth: true, // Smooth scrolling enable
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  
  requestAnimationFrame(raf);
  