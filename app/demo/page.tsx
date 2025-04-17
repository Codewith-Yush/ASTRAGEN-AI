"use client";
import Link from "next/link";
import { useState } from "react";

export default function DemoPage() {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 p-4 md:p-8">
      <h1 className="text-3xl md:text-5xl font-bold mb-10 text-gray-900 dark:text-white text-center">
        Watch Demo
      </h1>
      
      {/* Video Container with Animation */}
      <div 
        className="w-full max-w-4xl relative rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          transform: isHovering ? 'translateY(-8px)' : 'translateY(0)',
          boxShadow: isHovering ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Video Frame */}
        <div className="w-full aspect-video relative">
          <iframe
            src="https://www.youtube.com/embed/jPskRlbqDPg?si=JytQPEQ1-dbOX1Q9"
            title="Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full z-0"
          />
          
          {/* Animated Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 z-10 opacity-0 transition-opacity duration-500 pointer-events-none" 
            style={{ opacity: isHovering ? 0.15 : 0 }}
          />
          
          {/* Animated Border */}
          <div 
            className="absolute inset-0 border-2 border-transparent transition-all duration-500 pointer-events-none z-20" 
            style={{ borderColor: isHovering ? 'rgba(99, 102, 241, 0.5)' : 'transparent' }}
          />
        </div>
      </div>
      
      {/* Back Button */}
      <div className="mt-12">
        <Link href="/">
          <span className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1">
            Back to Home
          </span>
        </Link>
      </div>
    </div>
  );
}