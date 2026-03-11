/**
 * AnimatedCounter Component
 * Smoothly animates numbers from 0 to target value
 */

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // milliseconds
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Reset when value changes
    countRef.current = 0;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      const currentCount = easeOut * value;

      countRef.current = currentCount;
      setCount(currentCount);

      if (percentage < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals)
    : Math.floor(count).toString();

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};
