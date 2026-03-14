import AnimeCard from '@/Components/AnimeCard';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ContentTypeSwitcher from '@/Components/ContentTypeSwitcher';
import HeroBanner from '@/Components/HeroBanner';
import SkeletonGrid from '@/Components/SkeletonGrid';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import usePageLoading from '@/hooks/usePageLoading';
import { AnimeResult, AnimeSearchResponse, WatchHistoryItem } from '@/types/anime';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface HomeProps {
    trending: AnimeSearchResponse;
    popular: AnimeSearchResponse;
    recent: AnimeSearchResponse;
    continueWatching?: WatchHistoryItem[];
}

function AnimeGrid({
    title,
    items,
}: {
    title: string;
    items: AnimeResult[];
}) {
    if (!items || items.length === 0) return null;

    return (
        <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-primary">
                    {title}
                </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((anime) => (
                    <AnimeCard
                        key={anime.id}
                        id={anime.id}
                        title={anime.title}
                        image={anime.image}
                        rating={anime.rating}
                        type={anime.type}
                        episodeCount={anime.totalEpisodes}
                    />
                ))}
            </div>
        </section>
    );
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

                <form
                    onSubmit={handleSearch}
                    className="hidden flex-1 sm:mx-8 sm:block sm:max-w-md"
                >
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search anime..."
                            className="w-full rounded-full border-subtle bg-input py-2 pl-4 pr-10 text-sm text-primary placeholder-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-primary"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </form>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('login')}
                        className="text-sm text-theme-secondary hover:text-primary"
                    >
                        Log in
                    </Link>
                    <Link
                        href={route('register')}
                        className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-base hover:bg-secondary-hover"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function HomeContent({ trending, popular, recent, continueWatching }: HomeProps) {
    const loading = usePageLoading();

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-4 h-7 w-32 animate-pulse rounded bg-input" />
                <SkeletonGrid count={12} />
            </div>
        );
    }

    return (
        <>
            <Head title="Home" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Hero Banner */}
                {trending?.results?.length > 0 && (
                    <HeroBanner
                        slides={trending.results.slice(0, 5).map((anime) => ({
                            id: anime.id,
                            title: anime.title,
                            image: anime.image,
                            rating: anime.rating,
                            type: anime.type,
                            watchUrl: route('anime.show', { id: anime.id }),
                            detailUrl: route('anime.show', { id: anime.id }),
                        }))}
                    />
                )}

                {/* Continue Watching */}
                {continueWatching && continueWatching.length > 0 && (
                    <section className="mb-10">
                        <h2 className="mb-4 font-display text-xl font-bold text-primary">
                            Continue Watching
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {continueWatching.map((item) => {
                                const displayTitle =
                                    item.anime_title ||
                                    item.anime_id
                                        .replace(/-[a-z0-9]{3,5}$/, '')
                                        .replace(/-/g, ' ')
                                        .replace(/\b\w/g, (c) => c.toUpperCase());
                                const progressPercent = Math.min(
                                    (item.progress_seconds / 1440) * 100,
                                    95,
                                );
                                const watchedMin = Math.floor(
                                    item.progress_seconds / 60,
                                );

                                return (
                                    <Link
                                        key={item.id}
                                        href={route('anime.watch', {
                                            id: item.anime_id,
                                            episodeId: item.episode_id,
                                        })}
                                        className="group relative overflow-hidden rounded-xl border border-subtle bg-surface transition hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
                                    >
                                        {/* Poster / Thumbnail */}
                                        <div className="relative aspect-[16/7] w-full overflow-hidden bg-input">
                                            {item.anime_image ? (
                                                <img
                                                    src={item.anime_image}
                                                    alt={displayTitle}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-input to-subtle">
                                                    <svg
                                                        className="h-10 w-10 text-muted"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                                            {/* Play icon overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/90 shadow-lg">
                                                    <svg
                                                        className="ml-0.5 h-4 w-4 text-base"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {/* Episode badge */}
                                            <span className="absolute right-2 top-2 rounded-md bg-base/80 px-2 py-0.5 font-mono text-xs font-semibold text-accent backdrop-blur-sm">
                                                EP {item.episode_number}
                                            </span>
                                        </div>
                                        {/* Info */}
                                        <div className="px-3 pb-3 pt-2">
                                            <p className="truncate text-sm font-semibold text-primary">
                                                {displayTitle}
                                            </p>
                                            <p className="mt-0.5 text-xs text-theme-secondary">
                                                Episode {item.episode_number}
                                                {' · '}
                                                {watchedMin}m watched
                                            </p>
                                            {/* Progress bar */}
                                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-subtle">
                                                <div
                                                    className="h-full rounded-full bg-accent transition-all"
                                                    style={{
                                                        width: `${progressPercent}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                <AnimeGrid
                    title="Trending"
                    items={trending?.results || []}
                />
                <AnimeGrid title="Popular" items={popular?.results || []} />
                <AnimeGrid
                    title="Recently Updated"
                    items={recent?.results || []}
                />
            </div>
        </>
    );
}

export default function Home(props: HomeProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    if (auth?.user) {
        return (
            <AuthenticatedLayout>
                <HomeContent {...props} />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-base">
            <GuestNav />
            <HomeContent {...props} />
        </div>
    );
}
