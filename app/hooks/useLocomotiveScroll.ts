"use client";  // ✅ Add this line

import { useEffect, useRef, useState } from "react";
import LocomotiveScroll from "locomotive-scroll";

export const useLocomotiveScroll = () => {
  const scrollRef = useRef(null);
  const [scrollInstance, setScrollInstance] = useState(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scroll = new LocomotiveScroll({
        el: scrollRef.current,
        smooth: true,
        lerp: 0.08, // Smooth scrolling effect
      });

      setScrollInstance(scroll);

      return () => {
        scroll.destroy();
      };
    }
  }, []);

  return { scrollRef, scrollInstance };
};
