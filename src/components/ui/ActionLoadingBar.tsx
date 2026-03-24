import { useEffect, useRef, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

const USER_ACTION_FEEDBACK_MS = 700;

export function ActionLoadingBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const [isActionFeedbackActive, setIsActionFeedbackActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const feedbackTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const isBusy = isFetching > 0 || isMutating > 0 || isActionFeedbackActive;

  useEffect(() => {
    const handleUserAction = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const actionable = target.closest(
        'button, a, [role="button"], input[type="submit"], input[type="button"]',
      );

      if (!actionable) {
        return;
      }

      setIsActionFeedbackActive(true);

      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }

      feedbackTimeoutRef.current = window.setTimeout(() => {
        setIsActionFeedbackActive(false);
      }, USER_ACTION_FEEDBACK_MS);
    };

    document.addEventListener('pointerdown', handleUserAction, true);

    return () => {
      document.removeEventListener('pointerdown', handleUserAction, true);
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isBusy) {
      setIsVisible(true);
      setProgress((prev) => (prev < 8 ? 8 : prev));

      if (!progressIntervalRef.current) {
        progressIntervalRef.current = window.setInterval(() => {
          setProgress((prev) => {
            if (prev >= 92) {
              return prev;
            }
            const delta = Math.max(0.6, (92 - prev) * 0.08);
            return Math.min(92, prev + delta);
          });
        }, 80);
      }

      return;
    }

    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (!isVisible) {
      return;
    }

    setProgress(100);
    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 260);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [isBusy, isVisible]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 top-0 h-[3px] w-full overflow-hidden transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-orange-400 via-amber-500 to-red-500 shadow-[0_0_12px_rgba(249,115,22,0.75)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
