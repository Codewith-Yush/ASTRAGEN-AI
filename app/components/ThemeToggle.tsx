"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Switch = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true); // Ensures the component is mounted before rendering
  }, []);
  
  if (!mounted) return null; // Prevent hydration mismatch
  
  const handleChange = () => {
    // Toggle theme between dark and light
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <StyledWrapper>
      <label className="switch">
        <input
          id="input"
          type="checkbox"
          checked={theme === "dark"} // Use theme state for controlling the checkbox
          onChange={handleChange} // Handle change when toggling the checkbox
        />
        <div className="slider round">
          <div className="sun-moon">
            {/* Sun/Moon icons */}
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}
          </div>
          <div className="stars">
            {/* Star icons for dark mode */}
            <svg className="star star-1" xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="white" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <svg className="star star-2" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24" fill="white" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Fixed position styles */
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000; /* Ensure it stays above other content */
  
  .switch {
    position: relative;
    display: inline-block;
    width: 64px;
    height: 36px;
    transform: scale(1.1);
  }
  
  .switch #input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* Update gradient to be more vibrant */
    background: linear-gradient(to bottom, #FFDADA, #AEE2FF);
    -webkit-transition: 0.4s;
    transition: 0.4s;
    z-index: 0;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .sun-moon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    width: 28px;
    left: 4px;
    bottom: 3px;
    color: #1e293b;
    background-color: #FFD43B;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }
  
  #input:checked + .slider {
    /* Update dark mode background to be more defined */
    background: linear-gradient(to bottom, #0f172a, #1e293b); /* slate-900 to slate-800 */
    border: 1px solid rgba(30, 41, 59, 0.8);
  }
  
  #input:focus + .slider {
    box-shadow: 0 0 4px #2196f3;
  }
  
  #input:checked + .slider .sun-moon {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
    background-color: #E2E8F0;
    color: #0F172A;
    -webkit-animation: rotate-center 0.6s ease-in-out both;
    animation: rotate-center 0.6s ease-in-out both;
  }
  
  .slider.round {
    border-radius: 34px;
  }
  
  .slider.round .sun-moon {
    border-radius: 50%;
  }
  
  @keyframes rotate-center {
    0% {
      transform: translateX(0) rotate(0);
    }
    100% {
      transform: translateX(26px) rotate(360deg);
    }
  }
  
  .stars {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: 0.4s;
  }
  
  #input:checked + .slider .stars {
    opacity: 1;
  }
  
  .star {
    position: absolute;
    animation: star-twinkle 2s infinite;
  }
  
  .star-1 {
    top: 10px;
    right: 12px;
    animation-delay: 0.5s;
  }
  
  .star-2 {
    top: 16px;
    right: 22px;
    animation-delay: 1s;
  }
  
  @keyframes star-twinkle {
    0% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
  }
`;

export default Switch;