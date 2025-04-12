"use client";

import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <LoaderOverlay>
      <LoaderContainer>
        <SpinnerRing>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </SpinnerRing>
        <PulseCircle />
      </LoaderContainer>
    </LoaderOverlay>
  );
};

const LoaderOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  z-index: 9999;
`;

const LoaderContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SpinnerRing = styled.div`
  display: inline-block;
  position: absolute;
  width: 80px;
  height: 80px;
  
  div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 6px solid transparent;
    border-radius: 50%;
    animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    
    &:nth-child(1) {
      border-top-color: #3498db;
      animation-delay: -0.45s;
    }
    
    &:nth-child(2) {
      border-right-color: #e74c3c;
      animation-delay: -0.3s;
    }
    
    &:nth-child(3) {
      border-bottom-color: #f1c40f;
      animation-delay: -0.15s;
    }
    
    &:nth-child(4) {
      border-left-color: #2ecc71;
      animation-delay: 0;
    }
  }
  
  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const PulseCircle = styled.div`
  width: 32px;
  height: 32px;
  background-color: #9b59b6;
  border-radius: 50%;
  position: absolute;
  animation: pulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(155, 89, 182, 0.7);
  
  @keyframes pulse {
    0% {
      transform: scale(0.6);
      opacity: 1;
    }
    50% {
      transform: scale(0.9);
      opacity: 0.7;
    }
    100% {
      transform: scale(0.6);
      opacity: 1;
    }
  }
`;

export default Loader;