import { useEffect, useRef, useState } from 'react';
import type { Toast as ToastData, ToastType } from './ToastContext';

const icons: Record<ToastType, React.ReactNode> = {
    success: (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    info: (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const colorClasses: Record<ToastType, string> = {
    success: 'border-success/30 bg-success/10 text-success',
    error: 'border-danger/30 bg-danger/10 text-danger',
    info: 'border-accent/30 bg-accent/10 text-accent',
};

interface ToastProps {
    toast: ToastData;
    onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchCurrentX = useRef(0);
    const toastRef = useRef<HTMLDivElement>(null);

    // Slide in on mount
    useEffect(() => {
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    // Fade out before removing
    const handleDismiss = () => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
    };

    // Swipe-to-dismiss (mobile)
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchCurrentX.current = 0;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = e.touches[0].clientX - touchStartX.current;
        touchCurrentX.current = diff;
        if (toastRef.current && diff > 0) {
            toastRef.current.style.transform = `translateX(${diff}px)`;
            toastRef.current.style.opacity = `${Math.max(0, 1 - diff / 200)}`;
        }
    };

    const handleTouchEnd = () => {
        if (touchCurrentX.current > 80) {
            handleDismiss();
        } else if (toastRef.current) {
            toastRef.current.style.transform = '';
            toastRef.current.style.opacity = '';
        }
        touchStartX.current = null;
    };

    return (
        <div
            ref={toastRef}
            role="alert"
            onClick={handleDismiss}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 sm:w-auto sm:min-w-[300px] sm:max-w-[420px] ${colorClasses[toast.type]} ${
                visible && !exiting
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0'
            }`}
        >
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                }}
                className="shrink-0 opacity-60 transition hover:opacity-100"
                aria-label="Dismiss"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
