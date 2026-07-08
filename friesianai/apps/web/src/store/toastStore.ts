import { create } from 'zustand';
import { createId } from '@/utils/id';

export type ToastVariant = 'default' | 'success' | 'error';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'> & { id?: string }) => void;
  dismiss: (id: string) => void;
}

const TOAST_TTL = 3500;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? createId();
    set((state) => ({ toasts: [...state.toasts.slice(-3), { ...toast, id }] }));
    window.setTimeout(() => get().dismiss(id), TOAST_TTL);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative helper so non-React code (stores, services) can raise toasts. */
export const toast = {
  show: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'default' }),
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'error' }),
};
