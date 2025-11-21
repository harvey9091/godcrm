'use client';

import { useState, useEffect, useRef } from 'react';

interface UseAnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
}

export function useAnimatedNumber({
  value,
  duration = 1200,
  formatFn = (val) => val.toLocaleString()
}: UseAnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(formatFn(value));
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValueRef = useRef(value);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = previousValueRef.current;
    const endValue = value;
    
    // If values are the same, no need to animate
    if (startValue === endValue) {
      previousValueRef.current = value;
      return;
    }

    setIsAnimating(true);
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apple-style easing: fast acceleration for first 40%, slow easing for last 60%
      let easedProgress: number;
      if (progress <= 0.4) {
        // Fast acceleration (cubic ease-in)
        easedProgress = Math.pow(progress / 0.4, 3);
      } else {
        // Slow easing (ease-out)
        const adjustedProgress = (progress - 0.4) / 0.6;
        easedProgress = 1 - Math.pow(1 - adjustedProgress, 2);
      }
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(formatFn(currentValue));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setDisplayValue(formatFn(endValue));
        setIsAnimating(false);
        previousValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // Cleanup function to cancel animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, formatFn]);

  return { displayValue, isAnimating };
}