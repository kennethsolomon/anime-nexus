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
    watching: 'bg-blue-600',
    plan_to_watch: 'bg-yellow-600',
    completed: 'bg-green-600',
    dropped: 'bg-red-600',
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
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Watchlist
                </h2>
            }
        >
            <Head title="Watchlist" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                                className="flex gap-3 rounded-lg bg-white p-4 shadow"
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
                                            className="h-24 w-16 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-16 items-center justify-center rounded bg-gray-200 text-xs text-gray-400">
                                            No img
                                        </div>
                                    )}
                                </Link>
                                <div className="flex flex-1 flex-col">
                                    <Link
                                        href={route('anime.show', {
                                            id: item.anime_id,
                                        })}
                                        className="font-medium text-gray-900 hover:text-purple-600"
                                    >
                                        {item.anime_title}
                                    </Link>

                                    <div className="mt-1">
                                        <span
                                            className={`inline-block rounded px-2 py-0.5 text-xs text-white ${STATUS_COLORS[item.status] || 'bg-gray-600'}`}
                                        >
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="mt-auto flex gap-1 pt-2">
                                        <select
                                            value={item.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    item.id,
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded border-gray-300 py-1 text-xs"
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
                                            className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">
                        Your watchlist is empty. Browse anime and add some!
                    </p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
