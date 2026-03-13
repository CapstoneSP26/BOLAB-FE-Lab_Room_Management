/**
 * Toast Notification Component
 * Beautiful toast notifications for user feedback
 */

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-700',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    title: 'text-amber-900',
    message: 'text-amber-700',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        max-w-md w-full border-2 rounded-lg shadow-lg p-4
        animate-slide-in-right
        flex items-start gap-3
      `}
    >
      <Icon className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold ${styles.title} text-sm mb-0.5`}>
          {title}
        </h4>
        {message && (
          <p className={`text-sm ${styles.message}`}>
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className={`${styles.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
