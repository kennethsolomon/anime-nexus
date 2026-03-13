import EpisodeList from '@/Components/EpisodeList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AnimeInfo, WatchlistItem } from '@/types/anime';
import { Head, router, usePage } from '@inertiajs/react';

interface AnimeDetailProps {
    anime: AnimeInfo;
    watchlistEntry?: WatchlistItem | null;
}

function AnimeDetailContent({ anime, watchlistEntry }: AnimeDetailProps) {
    const { auth } = usePage().props as {
        auth?: { user?: { id: number } };
    };

    if (anime.error) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-red-900/30 p-8 text-center">
                    <h2 className="text-xl font-bold text-red-400">
                        Failed to load anime
                    </h2>
                    <p className="mt-2 text-gray-400">
                        {anime.message || 'Source unavailable'}
                    </p>
                    <button
                        onClick={() => router.reload()}
                        className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const handleAddToWatchlist = (status: string) => {
        router.post(route('watchlist.store'), {
            anime_id: anime.id,
            anime_title: anime.title,
            anime_image: anime.image,
            status,
        });
    };

    return (
        <>
            <Head title={anime.title} />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Hero section */}
                <div className="flex flex-col gap-6 md:flex-row">
                    {/* Cover image */}
                    <div className="w-full shrink-0 md:w-64">
                        <img
                            src={anime.image}
                            alt={anime.title}
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white">
                            {anime.title}
                        </h1>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {anime.rating !== undefined &&
                                anime.rating > 0 && (
                                    <span className="rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-black">
                                        {anime.rating.toFixed(1)}
                                    </span>
                                )}
                            {anime.type && (
                                <span className="rounded bg-purple-600 px-2 py-1 text-sm text-white">
                                    {anime.type}
                                </span>
                            )}
                            {anime.status && (
                                <span className="rounded bg-gray-700 px-2 py-1 text-sm text-gray-300">
                                    {anime.status}
                                </span>
                            )}
                            {anime.releaseDate && (
                                <span className="rounded bg-gray-700 px-2 py-1 text-sm text-gray-300">
                                    {anime.releaseDate}
                                </span>
                            )}
                        </div>

                        {/* Genres */}
                        {anime.genres && anime.genres.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {anime.genres.map((genre) => (
                                    <a
                                        key={genre}
                                        href={route('anime.genre', {
                                            genre: genre.toLowerCase(),
                                        })}
                                        className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700"
                                    >
                                        {genre}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {anime.description && (
                            <p className="mt-4 leading-relaxed text-gray-300">
                                {anime.description.replace(/<[^>]*>/g, '')}
                            </p>
                        )}

                        {/* Watchlist actions */}
                        {auth?.user && (
                            <div className="mt-6 flex flex-wrap items-center gap-2">
                                {watchlistEntry && (
                                    <span className="mr-2 text-sm text-gray-400">
                                        Status:{' '}
                                        <span className="font-semibold text-purple-400">
                                            {watchlistEntry.status.replace('_', ' ')}
                                        </span>
                                    </span>
                                )}
                                {['watching', 'plan_to_watch', 'completed'].map((status) => {
                                    const isActive = watchlistEntry?.status === status;
                                    const labels: Record<string, string> = {
                                        watching: 'Watching',
                                        plan_to_watch: 'Plan to Watch',
                                        completed: 'Completed',
                                    };
                                    const colors: Record<string, string> = {
                                        watching: isActive ? 'bg-purple-700 ring-2 ring-purple-400' : 'bg-purple-600 hover:bg-purple-700',
                                        plan_to_watch: isActive ? 'bg-gray-600 ring-2 ring-gray-400' : 'bg-gray-700 hover:bg-gray-600',
                                        completed: isActive ? 'bg-green-600 ring-2 ring-green-400' : 'bg-green-700 hover:bg-green-600',
                                    };
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => handleAddToWatchlist(status)}
                                            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${colors[status]}`}
                                        >
                                            {labels[status]}
                                        </button>
                                    );
                                })}
                                {watchlistEntry && (
                                    <button
                                        onClick={() =>
                                            router.delete(
                                                route('watchlist.destroy', {
                                                    watchlist: watchlistEntry.id,
                                                }),
                                            )
                                        }
                                        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Episodes */}
                {anime.episodes && anime.episodes.length > 0 && (
                    <div className="mt-8">
                        <EpisodeList
                            animeId={anime.id}
                            episodes={anime.episodes}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

export default function AnimeDetail(props: AnimeDetailProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    if (auth?.user) {
        return (
            <AuthenticatedLayout>
                <AnimeDetailContent {...props} />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <AnimeDetailContent {...props} />
        </div>
    );
}
