import Toast from './Toast';
import type { Toast as ToastData } from './ToastContext';

interface ToastContainerProps {
    toasts: ToastData[];
    onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="polite"
            aria-atomic="false"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:items-end"
        >
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
                    <Toast toast={toast} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}
