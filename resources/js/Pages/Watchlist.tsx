import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { WatchlistItem } from '@/types/anime';
import { Head, Link, router } from '@inertiajs/react';

interface WatchlistProps {
    watchlist: WatchlistItem[];
    currentStatus: string;
}

const STATUSES = [
    { value: 'all', label: 'All' },
    { value: 'watching', label: 'Watching' },
    { value: 'plan_to_watch', label: 'Plan to Watch' },
    { value: 'completed', label: 'Completed' },
    { value: 'dropped', label: 'Dropped' },
];

const STATUS_COLORS: Record<string, string> = {
    watching: 'bg-accent',
    plan_to_watch: 'bg-secondary',
    completed: 'bg-success',
    dropped: 'bg-danger',
};

export default function Watchlist({ watchlist, currentStatus }: WatchlistProps) {
    const handleStatusChange = (itemId: number, newStatus: string) => {
        router.patch(route('watchlist.update', { watchlist: itemId }), {
            status: newStatus,
        });
    };

    const handleRemove = (itemId: number) => {
        router.delete(route('watchlist.destroy', { watchlist: itemId }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Watchlist" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="mb-6 font-display text-2xl font-bold text-primary">
                    My Watchlist
                </h1>

                {/* Status tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                        <button
                            key={status.value}
                            onClick={() =>
                                router.get(route('watchlist.index'), {
                                    status: status.value,
                                })
                            }
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                currentStatus === status.value
                                    ? 'bg-accent text-base'
                                    : 'border border-muted bg-input text-theme-secondary hover:border-accent hover:text-primary'
                            }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>

                {/* Watchlist items */}
                {watchlist.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {watchlist.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 rounded-xl border border-subtle bg-surface p-4 transition hover:border-muted"
                            >
                                <Link
                                    href={route('anime.show', {
                                        id: item.anime_id,
                                    })}
                                    className="shrink-0"
                                >
                                    {item.anime_image ? (
                                        <img
                                            src={item.anime_image}
                                            alt={item.anime_title}
                                            className="h-24 w-16 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-input text-xs text-theme-muted">
                                            No img
                                        </div>
                                    )}
                                </Link>
                                <div className="flex flex-1 flex-col">
                                    <Link
                                        href={route('anime.show', {
                                            id: item.anime_id,
                                        })}
                                        className="font-medium text-primary hover:text-accent"
                                    >
                                        {item.anime_title}
                                    </Link>

                                    <div className="mt-1">
                                        <span
                                            className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${STATUS_COLORS[item.status] || 'bg-muted'}`}
                                        >
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="mt-auto flex gap-2 pt-2">
                                        <select
                                            value={item.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    item.id,
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-lg border-subtle bg-input py-1 text-xs text-primary focus:border-accent focus:ring-accent"
                                        >
                                            <option value="watching">
                                                Watching
                                            </option>
                                            <option value="plan_to_watch">
                                                Plan to Watch
                                            </option>
                                            <option value="completed">
                                                Completed
                                            </option>
                                            <option value="dropped">
                                                Dropped
                                            </option>
                                        </select>
                                        <button
                                            onClick={() =>
                                                handleRemove(item.id)
                                            }
                                            className="rounded-lg px-2 py-1 text-xs text-danger hover:bg-danger/10"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-subtle bg-surface p-8 text-center">
                        <p className="text-theme-secondary">
                            Your watchlist is empty.
                        </p>
                        <Link
                            href={route('home')}
                            className="mt-3 inline-block text-sm text-accent hover:text-accent-hover"
                        >
                            Browse anime to add some
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
