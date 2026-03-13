/**
 * useToast Hook
 * Global toast notification management
 */

import { create } from 'zustand';
import type { ToastType } from '../components/Toast';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export const useToast = () => {
  const { addToast, removeToast } = useToastStore();

  return {
    success: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration });
    },
    error: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration });
    },
    warning: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration });
    },
    info: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration });
    },
    remove: removeToast,
  };
};