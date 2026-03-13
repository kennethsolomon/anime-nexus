import AnimeCard from '@/Components/AnimeCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AnimeResult, AnimeSearchResponse, WatchHistoryItem } from '@/types/anime';
import { Head, Link, usePage } from '@inertiajs/react';

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
        <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
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

function HomeContent({ trending, popular, recent, continueWatching }: HomeProps) {
    return (
        <>
            <Head title="Home" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Search bar */}
                <div className="mb-8">
                    <form action={route('anime.search')} method="get">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search anime..."
                            className="w-full rounded-lg border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                        />
                    </form>
                </div>

                {/* Continue Watching */}
                {continueWatching && continueWatching.length > 0 && (
                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-white">
                            Continue Watching
                        </h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {continueWatching.map((item) => (
                                <Link
                                    key={item.id}
                                    href={route('anime.watch', {
                                        id: item.anime_id,
                                        episodeId: item.episode_id,
                                    })}
                                    className="flex items-center gap-3 rounded-lg bg-gray-800 p-3 transition hover:bg-gray-700"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-purple-600">
                                        <span className="text-sm font-bold text-white">
                                            EP {item.episode_number}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {item.anime_id}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Episode {item.episode_number} &middot;{' '}
                                            {Math.floor(item.progress_seconds / 60)}m watched
                                        </p>
                                    </div>
                                </Link>
                            ))}
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
        <div className="min-h-screen bg-gray-950">
            <nav className="border-b border-gray-800 bg-gray-900">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="text-xl font-bold text-purple-400"
                    >
                        WatchAnime
                    </Link>
                    <div className="flex gap-4">
                        <Link
                            href={route('login')}
                            className="text-sm text-gray-300 hover:text-white"
                        >
                            Log in
                        </Link>
                        <Link
                            href={route('register')}
                            className="rounded-md bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </nav>
            <HomeContent {...props} />
        </div>
    );
}
