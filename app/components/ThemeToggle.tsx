"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styled from "styled-components"; // assuming you're using styled-components for styling

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
            {/* Insert sun and moon icons here */}
          </div>
          <div className="stars">
            {/* Insert star SVGs for visual effect */}
          </div>
        </div>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
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
    background-color: #2196f3;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    z-index: 0;
    overflow: hidden;
  }

  .sun-moon {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: yellow;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  #input:checked + .slider {
    background-color: black;
  }

  #input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
  }

  #input:checked + .slider .sun-moon {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
    background-color: white;
    -webkit-animation: rotate-center 0.6s ease-in-out both;
    animation: rotate-center 0.6s ease-in-out both;
  }

  .slider.round {
    border-radius: 34px;
  }

  .slider.round .sun-moon {
    border-radius: 50%;
  }

  @keyframes cloud-move {
    0% {
      transform: translateX(0px);
    }

    40% {
      transform: translateX(4px);
    }

    80% {
      transform: translateX(-4px);
    }

    100% {
      transform: translateX(0px);
    }
  }

  .stars {
    transform: translateY(-32px);
    opacity: 0;
    transition: 0.4s;
  }

  @keyframes star-twinkle {
    0% {
      transform: scale(1);
    }

    40% {
      transform: scale(1.2);
    }

    80% {
      transform: scale(0.8);
    }

    100% {
      transform: scale(1);
    }
  }
`;

export default Switch;
