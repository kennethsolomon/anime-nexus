import { createContext, useCallback, useContext, useState } from 'react';
import ToastContainer from './ToastContainer';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    timestamp: number;
}

interface ToastContextValue {
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (message: string, type: ToastType) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const toast: Toast = { id, message, type, timestamp: Date.now() };

            setToasts((prev) => {
                const next = [...prev, toast];
                // Trim oldest if exceeding max
                if (next.length > MAX_TOASTS) {
                    return next.slice(next.length - MAX_TOASTS);
                }
                return next;
            });

            // Auto-dismiss after 3s
            setTimeout(() => removeToast(id), 3000);
        },
        [removeToast],
    );

    const success = useCallback(
        (message: string) => addToast(message, 'success'),
        [addToast],
    );
    const error = useCallback(
        (message: string) => addToast(message, 'error'),
        [addToast],
    );
    const info = useCallback(
        (message: string) => addToast(message, 'info'),
        [addToast],
    );

    return (
        <ToastContext.Provider
            value={{ addToast, removeToast, success, error, info }}
        >
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export type { Toast, ToastType };
