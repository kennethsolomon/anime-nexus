import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Notification {
    id: number;
    anime_id: string;
    anime_title: string;
    anime_image: string | null;
    content_type: 'anime' | 'drama';
    message: string;
    read: boolean;
    created_at: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications on mount
    useEffect(() => {
        fetch(route('notifications.index'), {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            })
            .catch(() => {});
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = (notif: Notification) => {
        // Mark as read
        router.patch(route('notifications.read', { episodeNotification: notif.id }), {}, { preserveScroll: true });
        setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));

        // Navigate to detail
        const detailRoute = notif.content_type === 'drama'
            ? route('drama.show', { id: notif.anime_id })
            : route('anime.show', { id: notif.anime_id });
        router.get(detailRoute);
        setOpen(false);
    };

    const handleMarkAllRead = () => {
        router.post(route('notifications.readAll'), {}, { preserveScroll: true });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative rounded-lg p-2 text-theme-secondary transition hover:text-primary"
                title="Notifications"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-subtle bg-surface shadow-xl sm:w-96">
                        <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
                            <h3 className="text-sm font-bold text-primary">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-accent hover:text-accent-hover"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleClick(notif)}
                                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-input ${
                                            !notif.read ? 'bg-accent/5' : ''
                                        }`}
                                    >
                                        {notif.anime_image && (
                                            <img
                                                src={notif.anime_image}
                                                alt=""
                                                className="h-10 w-7 shrink-0 rounded object-cover"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-primary">
                                                {notif.anime_title}
                                            </p>
                                            <p className="text-xs text-theme-secondary">{notif.message}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-theme-muted">
                                            {timeAgo(notif.created_at)}
                                        </span>
                                        {!notif.read && (
                                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-theme-muted">
                                    No notifications yet
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
