import ApplicationLogo from '@/Components/ApplicationLogo';
import EpisodeList from '@/Components/EpisodeList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AnimeInfo, WatchlistItem } from '@/types/anime';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { useRef, useState } from 'react';

interface AnimeDetailProps {
    anime: AnimeInfo;
    watchlistEntry?: WatchlistItem | null;
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

function WatchlistDropdown({
    animeId,
    animeTitle,
    animeImage,
    watchlistEntry,
}: {
    animeId: string;
    animeTitle: string;
    animeImage: string;
    watchlistEntry?: WatchlistItem | null;
}) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const statuses = [
        { value: 'watching', label: 'Watching' },
        { value: 'plan_to_watch', label: 'Plan to Watch' },
        { value: 'completed', label: 'Completed' },
        { value: 'dropped', label: 'Dropped' },
    ];

    const handleSelect = (status: string) => {
        router.post(route('watchlist.store'), {
            anime_id: animeId,
            anime_title: animeTitle,
            anime_image: animeImage,
            status,
        });
        setOpen(false);
    };

    const handleRemove = () => {
        if (watchlistEntry) {
            router.delete(route('watchlist.destroy', { watchlist: watchlistEntry.id }));
        }
        setOpen(false);
    };

    const currentLabel = watchlistEntry
        ? statuses.find((s) => s.value === watchlistEntry.status)?.label || 'In List'
        : 'Add to Watchlist';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    watchlistEntry
                        ? 'border-accent bg-accent/10 text-accent hover:bg-accent/20'
                        : 'border-muted bg-input text-primary hover:border-accent'
                }`}
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {currentLabel}
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-subtle bg-surface shadow-xl">
                        {statuses.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => handleSelect(status.value)}
                                className={`flex w-full items-center px-4 py-2 text-sm transition hover:bg-input ${
                                    watchlistEntry?.status === status.value
                                        ? 'text-accent'
                                        : 'text-primary'
                                }`}
                            >
                                {watchlistEntry?.status === status.value && (
                                    <svg className="mr-2 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {status.label}
                            </button>
                        ))}
                        {watchlistEntry && (
                            <>
                                <div className="border-t border-subtle" />
                                <button
                                    onClick={handleRemove}
                                    className="flex w-full items-center px-4 py-2 text-sm text-danger hover:bg-input"
                                >
                                    Remove
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function AnimeDetailContent({ anime, watchlistEntry }: AnimeDetailProps) {
    const { auth } = usePage().props as {
        auth?: { user?: { id: number } };
    };

    if (anime.error) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-danger/30 bg-danger/10 p-8 text-center">
                    <h2 className="text-xl font-bold text-danger">
                        Failed to load anime
                    </h2>
                    <p className="mt-2 text-theme-secondary">
                        {anime.message || 'Source unavailable'}
                    </p>
                    <button
                        onClick={() => router.reload()}
                        className="mt-4 rounded-lg bg-secondary px-4 py-2 font-medium text-base hover:bg-secondary-hover"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const firstEpisode = anime.episodes?.[0];

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
                            className="w-full rounded-xl shadow-lg"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="font-display text-3xl font-bold text-primary">
                            {anime.title}
                        </h1>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {anime.rating !== undefined && anime.rating > 0 && (
                                <span className="rounded-md bg-secondary px-2 py-1 font-mono text-sm font-bold text-base">
                                    {anime.rating.toFixed(1)}
                                </span>
                            )}
                            {anime.type && (
                                <span className="rounded-md bg-accent px-2 py-1 text-sm font-medium text-base">
                                    {anime.type}
                                </span>
                            )}
                            {anime.status && (
                                <span className="rounded-md border border-muted bg-input px-2 py-1 text-sm text-theme-secondary">
                                    {anime.status}
                                </span>
                            )}
                            {anime.releaseDate && (
                                <span className="rounded-md border border-muted bg-input px-2 py-1 text-sm text-theme-secondary">
                                    {anime.releaseDate}
                                </span>
                            )}
                            {anime.totalEpisodes !== undefined && anime.totalEpisodes > 0 && (
                                <span className="rounded-md border border-muted bg-input px-2 py-1 font-mono text-sm text-theme-secondary">
                                    {anime.totalEpisodes} eps
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
                                        className="rounded-full border border-muted px-3 py-1 text-xs text-theme-secondary transition hover:border-accent hover:text-accent"
                                    >
                                        {genre}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {anime.description && (
                            <div
                                className="mt-4 leading-relaxed text-theme-secondary"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(anime.description),
                                }}
                            />
                        )}

                        {/* Action buttons */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            {firstEpisode && (
                                <Link
                                    href={route('anime.watch', {
                                        id: anime.id,
                                        episodeId: firstEpisode.id,
                                    })}
                                    className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 font-medium text-base transition hover:bg-secondary-hover"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Watch EP 1
                                </Link>
                            )}
                            {auth?.user && (
                                <WatchlistDropdown
                                    animeId={anime.id}
                                    animeTitle={anime.title}
                                    animeImage={anime.image}
                                    watchlistEntry={watchlistEntry}
                                />
                            )}
                        </div>
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
        <div className="min-h-screen bg-base">
            <GuestNav />
            <AnimeDetailContent {...props} />
        </div>
    );
}
