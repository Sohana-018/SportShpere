"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface InteractiveMascotProps {
  isBlindfolded: boolean;
}

export function InteractiveMascot({ isBlindfolded }: InteractiveMascotProps) {
  // Spring physics for smooth eye tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  // Transform mouse position to pupil offset
  // Constrain movement to a small radius inside the eye
  const maxEyeOffset = 8;
  const pupilX = useTransform(smoothMouseX, [-1000, 1000], [-maxEyeOffset, maxEyeOffset]);
  const pupilY = useTransform(smoothMouseY, [-1000, 1000], [-maxEyeOffset, maxEyeOffset]);

  // Transform for subtle head tilt
  const headRotate = useTransform(smoothMouseX, [-1000, 1000], [-10, 10]);
  const headTilt = useTransform(smoothMouseY, [-1000, 1000], [-5, 5]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position relative to center of screen
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center select-none pointer-events-none">
      <motion.svg
        width="200"
        height="240"
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          rotateZ: headRotate,
          rotateX: headTilt,
        }}
        className="drop-shadow-2xl overflow-visible"
      >
        {/* Body/Jersey */}
        <path d="M 50 160 Q 100 140 150 160 L 170 240 L 30 240 Z" className="fill-primary" />
        {/* Jersey Number */}
        <text x="100" y="210" textAnchor="middle" className="fill-background font-black text-4xl" style={{ fontFamily: 'sans-serif' }}>01</text>
        {/* Jersey Collar */}
        <path d="M 80 150 Q 100 170 120 150" className="stroke-background" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Head Base */}
        <circle cx="100" cy="90" r="70" className="fill-primary" />
        
        {/* Headband */}
        <path d="M 30 80 Q 100 70 170 80 L 170 95 Q 100 85 30 95 Z" className="fill-background" />
        
        {/* Left Eye Whites */}
        <circle cx="65" cy="75" r="18" fill="white" />
        
        {/* Right Eye Whites */}
        <circle cx="135" cy="75" r="18" fill="white" />

        {/* Left Pupil */}
        <motion.circle 
          cx="65" cy="75" r="7" className="fill-background" 
          style={{ x: pupilX, y: pupilY }}
        />
        
        {/* Right Pupil */}
        <motion.circle 
          cx="135" cy="75" r="7" className="fill-background" 
          style={{ x: pupilX, y: pupilY }}
        />

        {/* Mouth */}
        <path 
          d={isBlindfolded ? "M 75 125 Q 100 115 125 125" : "M 75 120 Q 100 145 125 120"} 
          className="stroke-background" 
          strokeWidth="6" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* Hands */}
        <motion.g
          initial={false}
          animate={{
            y: isBlindfolded ? 0 : 120,
            opacity: isBlindfolded ? 1 : 0,
            scale: isBlindfolded ? 1 : 0.8
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          {/* Left Hand */}
          <rect x="40" y="50" width="50" height="35" rx="17.5" className="fill-primary stroke-background" strokeWidth="4" />
          
          {/* Right Hand */}
          <rect x="110" y="50" width="50" height="35" rx="17.5" className="fill-primary stroke-background" strokeWidth="4" />
        </motion.g>
      </motion.svg>
    </div>
  );
}
