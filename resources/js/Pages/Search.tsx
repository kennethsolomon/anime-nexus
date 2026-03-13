import AnimeCard from '@/Components/AnimeCard';
import ApplicationLogo from '@/Components/ApplicationLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AnimeSearchResponse } from '@/types/anime';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface SearchProps {
    results: AnimeSearchResponse | [];
    query: string;
    page: number;
    isGenre?: boolean;
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

function SearchContent({ results, query, page, isGenre }: SearchProps) {
    const [searchQuery, setSearchQuery] = useState(query);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get(route('anime.search'), { q: searchQuery });
        }
    };

    const resultData = Array.isArray(results) ? null : results;
    const items = resultData?.results || [];
    const hasNext = resultData?.hasNextPage || false;

    return (
        <>
            <Head title={isGenre ? `Genre: ${query}` : `Search: ${query}`} />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {!isGenre && (
                    <form onSubmit={handleSearch} className="mb-8 sm:hidden">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search anime..."
                            className="w-full rounded-full border-subtle bg-input px-4 py-3 text-primary placeholder-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                        />
                    </form>
                )}

                <h1 className="mb-6 font-display text-2xl font-bold text-primary">
                    {isGenre ? `Genre: ${query}` : `Results for "${query}"`}
                </h1>

                {items.length > 0 ? (
                    <>
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

                        {/* Pagination */}
                        <div className="mt-8 flex justify-center gap-4">
                            {page > 1 && (
                                <button
                                    onClick={() =>
                                        router.get(
                                            isGenre
                                                ? route('anime.genre', { genre: query })
                                                : route('anime.search'),
                                            {
                                                ...(isGenre ? {} : { q: query }),
                                                page: page - 1,
                                            },
                                        )
                                    }
                                    className="rounded-lg border border-muted bg-input px-4 py-2 text-sm text-primary transition hover:border-accent"
                                >
                                    Previous
                                </button>
                            )}
                            {hasNext && (
                                <button
                                    onClick={() =>
                                        router.get(
                                            isGenre
                                                ? route('anime.genre', { genre: query })
                                                : route('anime.search'),
                                            {
                                                ...(isGenre ? {} : { q: query }),
                                                page: page + 1,
                                            },
                                        )
                                    }
                                    className="rounded-lg border border-muted bg-input px-4 py-2 text-sm text-primary transition hover:border-accent"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    query && (
                        <p className="text-theme-secondary">
                            No results found for "{query}"
                        </p>
                    )
                )}
            </div>
        </>
    );
}

export default function Search(props: SearchProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    if (auth?.user) {
        return (
            <AuthenticatedLayout>
                <SearchContent {...props} />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-base">
            <GuestNav />
            <SearchContent {...props} />
        </div>
    );
}
