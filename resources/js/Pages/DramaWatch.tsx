import ApplicationLogo from '@/Components/ApplicationLogo';
import ContentTypeSwitcher from '@/Components/ContentTypeSwitcher';
import EpisodeList from '@/Components/EpisodeList';
import VideoPlayer from '@/Components/VideoPlayer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DramaInfo, StreamingResponse } from '@/types/anime';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface DramaWatchProps {
    drama: DramaInfo;
    streaming: StreamingResponse;
    episodeId: string;
    mediaId: string;
    embedUrl?: string;
    progress: number;
}

function GuestNav() {
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get(route('drama.search'), { q: searchQuery });
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
                        placeholder="Search dramas..."
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

function DramaWatchContent({ drama, streaming, episodeId, mediaId, embedUrl, progress }: DramaWatchProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };

    const source =
        streaming.sources?.find((s) => s.quality === 'default' || s.quality === 'auto') ||
        streaming.sources?.find((s) => s.isM3U8) ||
        streaming.sources?.[0];

    const currentEpisode = drama.episodes?.find((ep) => ep.id === episodeId);
    const currentIndex = drama.episodes?.findIndex((ep) => ep.id === episodeId) ?? -1;
    const prevEpisode = currentIndex > 0 ? drama.episodes?.[currentIndex - 1] : null;
    const nextEpisode = drama.episodes && currentIndex < drama.episodes.length - 1
        ? drama.episodes[currentIndex + 1]
        : null;

    const saveProgress = useCallback(
        (seconds: number) => {
            if (!auth?.user || !currentEpisode) return;
            router.post(
                route('history.store'),
                {
                    anime_id: drama.id,
                    anime_title: drama.title,
                    anime_image: drama.image,
                    episode_id: episodeId,
                    episode_number: currentEpisode.number,
                    progress_seconds: seconds,
                    completed: false,
                    content_type: 'drama',
                },
                { preserveScroll: true, preserveState: true },
            );
        },
        [auth, drama.id, drama.title, drama.image, episodeId, currentEpisode],
    );

    const handleEnded = useCallback(() => {
        if (auth?.user && currentEpisode) {
            router.post(
                route('history.store'),
                {
                    anime_id: drama.id,
                    anime_title: drama.title,
                    anime_image: drama.image,
                    episode_id: episodeId,
                    episode_number: currentEpisode.number,
                    progress_seconds: 0,
                    completed: true,
                    content_type: 'drama',
                },
                { preserveScroll: true, preserveState: true },
            );
        }
        if (nextEpisode) {
            router.get(
                route('drama.watch', { id: drama.id, episodeId: nextEpisode.id, mediaId }),
            );
        }
    }, [auth, drama.id, drama.title, drama.image, episodeId, currentEpisode, nextEpisode, mediaId]);

    return (
        <>
            <Head title={`${drama.title} - Episode ${currentEpisode?.number || ''}`} />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        {streaming.error || !source ? (
                            embedUrl ? (
                                <div className="aspect-video w-full overflow-hidden rounded-lg">
                                    <iframe
                                        src={embedUrl}
                                        className="h-full w-full border-0"
                                        allowFullScreen
                                        referrerPolicy="origin"
                                    />
                                </div>
                            ) : (
                                <div className="rounded-xl border border-danger/30 bg-danger/10 p-8 text-center">
                                    <h2 className="text-xl font-bold text-danger">Failed to load video</h2>
                                    <p className="mt-2 text-theme-secondary">
                                        {streaming.message || 'Streaming source unavailable.'}
                                    </p>
                                    <button onClick={() => router.reload()} className="mt-4 rounded-lg bg-secondary px-4 py-2 font-medium text-base hover:bg-secondary-hover">
                                        Retry
                                    </button>
                                </div>
                            )
                        ) : (
                            <VideoPlayer
                                url={source.url}
                                subtitles={streaming.subtitles}
                                startAt={progress}
                                onProgress={saveProgress}
                                onEnded={handleEnded}
                            />
                        )}

                        <div className="mt-4 flex items-center justify-between gap-2">
                            {prevEpisode ? (
                                <button
                                    onClick={() => router.get(route('drama.watch', { id: drama.id, episodeId: prevEpisode.id, mediaId }))}
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
                                {currentEpisode?.title || `Episode ${currentEpisode?.number}`}
                            </h2>

                            {nextEpisode ? (
                                <button
                                    onClick={() => router.get(route('drama.watch', { id: drama.id, episodeId: nextEpisode.id, mediaId }))}
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

                        <div className="mt-3">
                            <Link
                                href={route('drama.show', { id: drama.id })}
                                className="text-sm text-theme-secondary transition hover:text-accent"
                            >
                                {drama.title}
                            </Link>
                        </div>
                    </div>

                    <div>
                        {drama.episodes && (
                            <EpisodeList
                                animeId={drama.id}
                                episodes={drama.episodes}
                                currentEpisodeId={episodeId}
                                buildEpisodeUrl={(epId) =>
                                    route('drama.watch', { id: drama.id, episodeId: epId, mediaId })
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function DramaWatch(props: DramaWatchProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    if (auth?.user) {
        return (
            <AuthenticatedLayout>
                <DramaWatchContent {...props} />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-base">
            <GuestNav />
            <DramaWatchContent {...props} />
        </div>
    );
}
