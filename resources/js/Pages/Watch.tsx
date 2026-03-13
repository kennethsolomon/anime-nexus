import EpisodeList from '@/Components/EpisodeList';
import VideoPlayer from '@/Components/VideoPlayer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AnimeInfo, StreamingResponse } from '@/types/anime';
import { Head, router, usePage } from '@inertiajs/react';
import { useCallback } from 'react';

interface WatchProps {
    anime: AnimeInfo;
    streaming: StreamingResponse;
    episodeId: string;
    progress: number;
}

function WatchContent({ anime, streaming, episodeId, progress }: WatchProps) {
    const { auth } = usePage().props as {
        auth?: { user?: { id: number } };
    };

    // Find best quality source (prefer auto/default, then highest)
    const source =
        streaming.sources?.find((s) => s.quality === 'default' || s.quality === 'auto') ||
        streaming.sources?.find((s) => s.isM3U8) ||
        streaming.sources?.[0];

    const currentEpisode = anime.episodes?.find((ep) => ep.id === episodeId);
    const currentIndex =
        anime.episodes?.findIndex((ep) => ep.id === episodeId) ?? -1;
    const prevEpisode =
        currentIndex > 0 ? anime.episodes?.[currentIndex - 1] : null;
    const nextEpisode =
        anime.episodes && currentIndex < anime.episodes.length - 1
            ? anime.episodes[currentIndex + 1]
            : null;

    const saveProgress = useCallback(
        (seconds: number) => {
            if (!auth?.user || !currentEpisode) return;
            router.post(
                route('history.store'),
                {
                    anime_id: anime.id,
                    episode_id: episodeId,
                    episode_number: currentEpisode.number,
                    progress_seconds: seconds,
                    completed: false,
                },
                { preserveScroll: true, preserveState: true },
            );
        },
        [auth, anime.id, episodeId, currentEpisode],
    );

    const handleEnded = useCallback(() => {
        if (auth?.user && currentEpisode) {
            router.post(
                route('history.store'),
                {
                    anime_id: anime.id,
                    episode_id: episodeId,
                    episode_number: currentEpisode.number,
                    progress_seconds: 0,
                    completed: true,
                },
                { preserveScroll: true, preserveState: true },
            );
        }
        // Auto-play next episode
        if (nextEpisode) {
            router.get(
                route('anime.watch', {
                    id: anime.id,
                    episodeId: nextEpisode.id,
                }),
            );
        }
    }, [auth, anime.id, episodeId, currentEpisode, nextEpisode]);

    if (streaming.error || !source) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-red-900/30 p-8 text-center">
                    <h2 className="text-xl font-bold text-red-400">
                        Failed to load video
                    </h2>
                    <p className="mt-2 text-gray-400">
                        {streaming.message || 'Streaming source unavailable'}
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

    return (
        <>
            <Head
                title={`${anime.title} - Episode ${currentEpisode?.number || ''}`}
            />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Player */}
                    <div className="lg:col-span-2">
                        <VideoPlayer
                            url={source.url}
                            subtitles={streaming.subtitles}
                            startAt={progress}
                            onProgress={saveProgress}
                            onEnded={handleEnded}
                        />

                        {/* Episode navigation */}
                        <div className="mt-4 flex items-center justify-between">
                            {prevEpisode ? (
                                <button
                                    onClick={() =>
                                        router.get(
                                            route('anime.watch', {
                                                id: anime.id,
                                                episodeId: prevEpisode.id,
                                            }),
                                        )
                                    }
                                    className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                                >
                                    Previous
                                </button>
                            ) : (
                                <div />
                            )}

                            <h2 className="text-lg font-semibold text-white">
                                {currentEpisode?.title ||
                                    `Episode ${currentEpisode?.number}`}
                            </h2>

                            {nextEpisode ? (
                                <button
                                    onClick={() =>
                                        router.get(
                                            route('anime.watch', {
                                                id: anime.id,
                                                episodeId: nextEpisode.id,
                                            }),
                                        )
                                    }
                                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
                                >
                                    Next
                                </button>
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>

                    {/* Episode list sidebar */}
                    <div>
                        {anime.episodes && (
                            <EpisodeList
                                animeId={anime.id}
                                episodes={anime.episodes}
                                currentEpisodeId={episodeId}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Watch(props: WatchProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    if (auth?.user) {
        return (
            <AuthenticatedLayout>
                <WatchContent {...props} />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <WatchContent {...props} />
        </div>
    );
}
