import { atom } from 'nanostores';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

export const $toasts = atom<Toast[]>([]);

export const addToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type, duration };
    $toasts.set([...$toasts.get(), toast]);

    if (duration > 0) {
        setTimeout(() => {
            dismissToast(id);
        }, duration);
    }
};

export const dismissToast = (id: string) => {
    $toasts.set($toasts.get().filter(t => t.id !== id));
};
