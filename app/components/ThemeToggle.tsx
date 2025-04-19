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
          <div className="icon">
            {/* Sun/Moon icons */}
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="effects">
            {/* Particle and glow effects for both modes */}
            <svg className="particle particle-1" xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill={theme === "dark" ? "#E2E8F0" : "#FBBF24"} stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <svg className="particle particle-2" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24" fill={theme === "dark" ? "#A5B4FC" : "#F87171"} stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <svg className="particle particle-3" xmlns="http://www.w3.org/2000/svg" width="5" height="5" viewBox="0 0 24 24" fill={theme === "dark" ? "#FBCFE8" : "#34D399"} stroke="none">
              <circle cx="12" cy="12" r="12" />
            </svg>
            <svg className="glow glow-1" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill={theme === "dark" ? "rgba(165, 180, 252, 0.5)" : "rgba(251, 191, 36, 0.5)"} stroke="none">
              <circle cx="12" cy="12" r="12" />
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
    transition: transform 0.3s ease;
  }
  
  .switch:hover {
    transform: scale(1.05); /* Slight scale on hover for interactivity */
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
    /* Glassmorphism with dynamic gradient for light mode */
    background: ${({ theme }) => theme === "dark" 
      ? "linear-gradient(135deg, rgba(55, 65, 81, 0.3), rgba(109, 40, 217, 0.2))"
      : "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(251, 191, 36, 0.2))"};
    backdrop-filter: blur(12px);
    transition: all 0.4s ease-in-out;
    z-index: 0;
    overflow: hidden;
    border-radius: 36px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    animation: gradient-shift 5s infinite ease-in-out;
  }
  
  .icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    width: 30px;
    left: 3px;
    bottom: 3px;
    background: ${({ theme }) => theme === "dark" 
      ? "linear-gradient(135deg, rgba(55, 65, 81, 0.5), rgba(109, 40, 217, 0.4))"
      : "linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(251, 191, 36, 0.4))"};
    color: ${({ theme }) => theme === "dark" ? "#E2E8F0" : "#4B5563"};
    transition: all 0.4s ease-in-out;
    border-radius: 50%;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(6px);
    animation: pulse-glow 2s infinite ease-in-out;
  }
  
  #input:checked + .slider {
    /* Dark mode gradient */
    background: linear-gradient(135deg, rgba(55, 65, 81, 0.3), rgba(109, 40, 217, 0.2));
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
  
  #input:focus + .slider {
    box-shadow: 0 0 12px ${({ theme }) => theme === "dark" ? "rgba(109, 40, 217, 0.5)" : "rgba(251, 191, 36, 0.5)"};
  }
  
  #input:checked + .slider .icon {
    transform: translateX(28px) rotate(360deg);
    background: linear-gradient(135deg, rgba(55, 65, 81, 0.5), rgba(109, 40, 217, 0.4));
    color: #E2E8F0;
    animation: slide-bounce 0.4s ease-in-out;
  }
  
  .slider.round {
    border-radius: 36px;
  }
  
  .slider.round .icon {
    border-radius: 50%;
  }
  
  @keyframes pulse-glow {
    0% {
      box-shadow: 0 0 5px ${({ theme }) => theme === "dark" ? "rgba(109, 40, 217, 0.3)" : "rgba(251, 191, 36, 0.3)"};
    }
    50% {
      box-shadow: 0 0 15px ${({ theme }) => theme === "dark" ? "rgba(109, 40, 217, 0.5)" : "rgba(251, 191, 36, 0.5)"};
    }
    100% {
      box-shadow: 0 0 5px ${({ theme }) => theme === "dark" ? "rgba(109, 40, 217, 0.3)" : "rgba(251, 191, 36, 0.3)"};
    }
  }
  
  @keyframes slide-bounce {
    0% {
      transform: translateX(0);
      box-shadow: 0 0 0 rgba(0, 0, 0, 0.2);
    }
    50% {
      transform: translateX(14px) scale(1.2);
      box-shadow: 0 0 15px ${({ theme }) => theme === "dark" ? "rgba(109, 40, 217, 0.5)" : "rgba(251, 191, 36, 0.5)"};
    }
    100% {
      transform: translateX(28px) rotate(360deg);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    }
  }
  
  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .effects {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 1; /* Always visible in both modes */
  }
  
  .particle, .glow {
    position: absolute;
    animation: particle-drift 3s infinite ease-in-out;
  }
  
  .particle-1 {
    top: 8px;
    right: 10px;
    animation-delay: 0.2s;
  }
  
  .particle-2 {
    top: 14px;
    right: 18px;
    animation-delay: 0.5s;
  }
  
  .particle-3 {
    top: 6px;
    right: 14px;
    animation-delay: 0.8s;
  }
  
  .glow-1 {
    top: 12px;
    right: 22px;
    animation-delay: 1s;
    filter: blur(3px);
  }
  
  @keyframes particle-drift {
    0% {
      opacity: 0.3;
      transform: translate(0, 0) scale(0.8);
    }
    50% {
      opacity: 1;
      transform: translate(-5px, -5px) scale(1.2);
    }
    100% {
      opacity: 0.3;
      transform: translate(0, 0) scale(0.8);
    }
  }
`;

export default Switch;