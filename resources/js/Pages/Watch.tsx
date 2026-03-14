import ApplicationLogo from '@/Components/ApplicationLogo';
import CommentSection from '@/Components/CommentSection';
import ContentTypeSwitcher from '@/Components/ContentTypeSwitcher';
import EpisodeList from '@/Components/EpisodeList';
import SkeletonPlayer from '@/Components/SkeletonPlayer';
import { useToast } from '@/Components/ToastContext';
import VideoPlayer from '@/Components/VideoPlayer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import usePageLoading from '@/hooks/usePageLoading';
import { AnimeInfo, StreamingResponse } from '@/types/anime';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface WatchProps {
    anime: AnimeInfo;
    streaming: StreamingResponse;
    episodeId: string;
    progress: number;
}

function GuestNav() {
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get(route('anime.search'), { q: searchQuery });
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-subtle bg-surface">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link href="/" className="shrink-0">
                    <ApplicationLogo />
                </Link>
                <ContentTypeSwitcher />
                <form onSubmit={handleSearch} className="hidden flex-1 sm:mx-8 sm:block sm:max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search anime..."
                        className="w-full rounded-full border-subtle bg-input py-2 pl-4 pr-10 text-sm text-primary placeholder-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                </form>
                <div className="flex items-center gap-3">
                    <Link href={route('login')} className="text-sm text-theme-secondary hover:text-primary">Log in</Link>
                    <Link href={route('register')} className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-base hover:bg-secondary-hover">Register</Link>
                </div>
            </div>
        </nav>
    );
}

function WatchContent({ anime, streaming, episodeId, progress }: WatchProps) {
    const { auth } = usePage().props as {
        auth?: { user?: { id: number } };
    };
    const toast = useToast();
    const loading = usePageLoading();

    if (loading) {
        return <SkeletonPlayer />;
    }

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
                    anime_title: anime.title,
                    anime_image: anime.image,
                    episode_id: episodeId,
                    episode_number: currentEpisode.number,
                    progress_seconds: seconds,
                    completed: false,
                    content_type: 'anime',
                },
                { preserveScroll: true, preserveState: true },
            );
        },
        [auth, anime.id, anime.title, anime.image, episodeId, currentEpisode],
    );

    const handleEnded = useCallback(() => {
        if (auth?.user && currentEpisode) {
            router.post(
                route('history.store'),
                {
                    anime_id: anime.id,
                    anime_title: anime.title,
                    anime_image: anime.image,
                    episode_id: episodeId,
                    episode_number: currentEpisode.number,
                    progress_seconds: 0,
                    completed: true,
                    content_type: 'anime',
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => toast.success(`Episode ${currentEpisode.number} completed`),
                },
            );
        }
        if (nextEpisode) {
            router.get(
                route('anime.watch', {
                    id: anime.id,
                    episodeId: nextEpisode.id,
                }),
            );
        }
    }, [auth, anime.id, anime.title, anime.image, episodeId, currentEpisode, nextEpisode, toast]);

    return (
        <>
            <Head
                title={`${anime.title} - Episode ${currentEpisode?.number || ''}`}
            />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Player */}
                    <div className="lg:col-span-2">
                        {streaming.error || !source ? (
                            <div className="rounded-xl border border-danger/30 bg-danger/10 p-8 text-center">
                                <h2 className="text-xl font-bold text-danger">
                                    Failed to load video
                                </h2>
                                <p className="mt-2 text-theme-secondary">
                                    {streaming.message || 'Streaming source unavailable'}
                                </p>
                                <button
                                    onClick={() => router.reload()}
                                    className="mt-4 rounded-lg bg-secondary px-4 py-2 font-medium text-base hover:bg-secondary-hover"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <VideoPlayer
                                url={source.url}
                                subtitles={streaming.subtitles}
                                startAt={progress}
                                intro={streaming.intro}
                                outro={streaming.outro}
                                onProgress={saveProgress}
                                onEnded={handleEnded}
                            />
                        )}

                        {/* Episode navigation */}
                        <div className="mt-4 flex items-center justify-between gap-2">
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
                                    className="inline-flex items-center gap-1 rounded-lg border border-muted bg-input px-4 py-2 text-sm text-primary transition hover:border-accent hover:bg-surface"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    EP {prevEpisode.number}
                                </button>
                            ) : (
                                <div />
                            )}

                            <h2 className="min-w-0 truncate text-center font-display text-lg font-semibold text-primary">
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
                                    className="inline-flex items-center gap-1 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-base transition hover:bg-secondary-hover"
                                >
                                    EP {nextEpisode.number}
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ) : (
                                <div />
                            )}
                        </div>

                        {/* Anime title link */}
                        <div className="mt-3">
                            <Link
                                href={route('anime.show', { id: anime.id })}
                                className="text-sm text-theme-secondary transition hover:text-accent"
                            >
                                {anime.title}
                            </Link>
                        </div>

                        {/* Comments */}
                        <CommentSection
                            animeId={anime.id}
                            episodeId={episodeId}
                            contentType="anime"
                        />
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
        <div className="min-h-screen bg-base">
            <GuestNav />
            <WatchContent {...props} />
        </div>
    );
}
