import { useEffect, useRef, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

type LoadingBarProps = {
  className?: string;
  hideDelay?: number;
};

export function LoadingBar({
  className = '',
  hideDelay = 220,
}: LoadingBarProps) {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const activeCount = isFetching + isMutating;
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const previousActiveCountRef = useRef(0);
  const startedInBurstRef = useRef(0);
  const completedInBurstRef = useRef(0);
  const hideTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Smooth progress animation while loading
  useEffect(() => {
    if (activeCount > 0 && !progressIntervalRef.current) {
      progressIntervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          // Gradually increase progress, slowing down as we approach 95%
          if (prev >= 95) return 95;
          const increment = (95 - prev) * 0.08 + 0.5; // Logarithmic increment
          return Math.min(95, prev + increment);
        });
      }, 300);
    } else if (activeCount === 0 && progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [activeCount]);

  useEffect(() => {
    const previousActiveCount = previousActiveCountRef.current;

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (previousActiveCount === 0 && activeCount > 0) {
      startedInBurstRef.current = activeCount;
      completedInBurstRef.current = 0;
      setIsVisible(true);
      setProgress(8);
    } else if (activeCount > previousActiveCount) {
      startedInBurstRef.current += activeCount - previousActiveCount;
    } else if (activeCount < previousActiveCount) {
      completedInBurstRef.current += previousActiveCount - activeCount;
    }

    if (previousActiveCount > 0 && activeCount === 0) {
      setProgress(100);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      hideTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
        startedInBurstRef.current = 0;
        completedInBurstRef.current = 0;
        hideTimeoutRef.current = null;
      }, hideDelay);
    }

    previousActiveCountRef.current = activeCount;
  }, [activeCount, hideDelay]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none relative h-1 w-full overflow-hidden bg-gray-200 dark:bg-gray-800/60 ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-y-0 left-0 origin-left bg-orange-500 transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}