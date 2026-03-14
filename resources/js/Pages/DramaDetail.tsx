import ApplicationLogo from '@/Components/ApplicationLogo';
import ContentTypeSwitcher from '@/Components/ContentTypeSwitcher';
import EpisodeList from '@/Components/EpisodeList';
import FavoriteButton from '@/Components/FavoriteButton';
import ReviewSection from '@/Components/ReviewSection';
import ShareButton from '@/Components/ShareButton';
import SkeletonDetail from '@/Components/SkeletonDetail';
import { useToast } from '@/Components/ToastContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import usePageLoading from '@/hooks/usePageLoading';
import { DramaEpisode, DramaInfo, ReviewItem, WatchlistItem } from '@/types/anime';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { useRef, useState } from 'react';

interface DramaDetailProps {
    drama: DramaInfo;
    watchlistEntry?: WatchlistItem | null;
    reviews?: ReviewItem[];
    userReview?: ReviewItem | null;
    isFavorited?: boolean;
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

function WatchlistDropdown({
    dramaId,
    dramaTitle,
    dramaImage,
    watchlistEntry,
}: {
    dramaId: string;
    dramaTitle: string;
    dramaImage: string;
    watchlistEntry?: WatchlistItem | null;
}) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    const statuses = [
        { value: 'watching', label: 'Watching' },
        { value: 'plan_to_watch', label: 'Plan to Watch' },
        { value: 'completed', label: 'Completed' },
        { value: 'dropped', label: 'Dropped' },
    ];

    const handleSelect = (status: string) => {
        const label = statuses.find((s) => s.value === status)?.label || status;
        router.post(route('watchlist.store'), {
            anime_id: dramaId,
            anime_title: dramaTitle,
            anime_image: dramaImage,
            status,
            content_type: 'drama',
        }, {
            onSuccess: () => toast.success(`Marked as "${label}"`),
            onError: () => toast.error('Failed to update watchlist'),
        });
        setOpen(false);
    };

    const handleRemove = () => {
        if (watchlistEntry) {
            router.delete(route('watchlist.destroy', { watchlist: watchlistEntry.id }), {
                onSuccess: () => toast.success('Removed from watchlist'),
                onError: () => toast.error('Failed to remove from watchlist'),
            });
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
                                    watchlistEntry?.status === status.value ? 'text-accent' : 'text-primary'
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
                                <button onClick={handleRemove} className="flex w-full items-center px-4 py-2 text-sm text-danger hover:bg-input">
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

function DramaDetailContent({ drama, watchlistEntry, reviews = [], userReview, isFavorited = false }: DramaDetailProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };
    const episodes = (drama.episodes || []) as DramaEpisode[];
    const seasons = [...new Set(episodes.map((ep) => ep.season))].sort((a, b) => a - b);
    const [selectedSeason, setSelectedSeason] = useState(seasons[0] || 1);
    const loading = usePageLoading();

    if (loading) {
        return <SkeletonDetail />;
    }

    if (drama.error) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-danger/30 bg-danger/10 p-8 text-center">
                    <h2 className="text-xl font-bold text-danger">Failed to load drama</h2>
                    <p className="mt-2 text-theme-secondary">{drama.message || 'Source unavailable'}</p>
                    <button onClick={() => router.reload()} className="mt-4 rounded-lg bg-secondary px-4 py-2 font-medium text-base hover:bg-secondary-hover">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const filteredEpisodes = seasons.length > 1
        ? episodes.filter((ep) => ep.season === selectedSeason)
        : episodes;

    const firstEpisode = filteredEpisodes[0];

    return (
        <>
            <Head title={drama.title} />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 md:flex-row">
                    <div className="w-full shrink-0 md:w-64">
                        <img src={drama.image} alt={drama.title} className="w-full rounded-xl shadow-lg" />
                    </div>

                    <div className="flex-1">
                        <h1 className="font-display text-3xl font-bold text-primary">{drama.title}</h1>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {drama.rating !== undefined && drama.rating > 0 && (
                                <span className="rounded-md bg-secondary px-2 py-1 font-mono text-sm font-bold text-base">
                                    {drama.rating.toFixed(1)}
                                </span>
                            )}
                            {drama.type && (
                                <span className="rounded-md bg-accent px-2 py-1 text-sm font-medium text-base">{drama.type}</span>
                            )}
                            {drama.status && (
                                <span className="rounded-md border border-muted bg-input px-2 py-1 text-sm text-theme-secondary">{drama.status}</span>
                            )}
                            {drama.country && (
                                <span className="rounded-md border border-muted bg-input px-2 py-1 text-sm text-theme-secondary">{drama.country}</span>
                            )}
                            {drama.releaseDate && (
                                <span className="rounded-md border border-muted bg-input px-2 py-1 text-sm text-theme-secondary">{drama.releaseDate}</span>
                            )}
                            {drama.duration && (
                                <span className="rounded-md border border-muted bg-input px-2 py-1 font-mono text-sm text-theme-secondary">{drama.duration}</span>
                            )}
                            {drama.totalEpisodes !== undefined && drama.totalEpisodes > 0 && (
                                <span className="rounded-md border border-muted bg-input px-2 py-1 font-mono text-sm text-theme-secondary">
                                    {drama.totalEpisodes} eps
                                </span>
                            )}
                        </div>

                        {/* Casts */}
                        {drama.casts && drama.casts.length > 0 && (
                            <div className="mt-3">
                                <span className="text-sm font-medium text-theme-secondary">Cast: </span>
                                <span className="text-sm text-primary">{drama.casts.join(', ')}</span>
                            </div>
                        )}

                        {drama.production && (
                            <div className="mt-1">
                                <span className="text-sm font-medium text-theme-secondary">Production: </span>
                                <span className="text-sm text-primary">{drama.production}</span>
                            </div>
                        )}

                        {/* Genres */}
                        {drama.genres && drama.genres.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {drama.genres.map((genre) => (
                                    <span key={genre} className="rounded-full border border-muted px-3 py-1 text-xs text-theme-secondary">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {drama.description && (
                            <div
                                className="mt-4 leading-relaxed text-theme-secondary"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(drama.description) }}
                            />
                        )}

                        {/* Action buttons */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            {firstEpisode && (
                                <Link
                                    href={route('drama.watch', { id: drama.id, episodeId: firstEpisode.id, mediaId: drama.id })}
                                    className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 font-medium text-base transition hover:bg-secondary-hover"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Watch EP 1
                                </Link>
                            )}
                            {auth?.user && (
                                <>
                                    <WatchlistDropdown
                                        dramaId={drama.id}
                                        dramaTitle={drama.title}
                                        dramaImage={drama.image}
                                        watchlistEntry={watchlistEntry}
                                    />
                                    <FavoriteButton
                                        animeId={drama.id}
                                        animeTitle={drama.title}
                                        animeImage={drama.image}
                                        contentType="drama"
                                        isFavorited={isFavorited}
                                    />
                                    <ShareButton title={drama.title} />
                                </>
                            )}
                            {!auth?.user && <ShareButton title={drama.title} />}
                        </div>
                    </div>
                </div>

                {/* Season selector + Episodes */}
                {episodes.length > 0 && (
                    <div className="mt-8">
                        {seasons.length > 1 && (
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-sm font-medium text-theme-secondary">Season:</span>
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                    className="rounded-lg border-subtle bg-input px-3 py-1.5 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                                >
                                    {seasons.map((s) => (
                                        <option key={s} value={s}>Season {s}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <EpisodeList
                            animeId={drama.id}
                            episodes={filteredEpisodes}
                            buildEpisodeUrl={(episodeId) =>
                                route('drama.watch', { id: drama.id, episodeId, mediaId: drama.id })
                            }
                        />
                    </div>
                )}

                {/* Reviews */}
                <ReviewSection
                    animeId={drama.id}
                    contentType="drama"
                    reviews={reviews}
                    userReview={userReview}
                />
            </div>
        </>
    );
}

export default function DramaDetail(props: DramaDetailProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    if (auth?.user) {
        return (
            <AuthenticatedLayout>
                <DramaDetailContent {...props} />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-base">
            <GuestNav />
            <DramaDetailContent {...props} />
        </div>
    );
}
