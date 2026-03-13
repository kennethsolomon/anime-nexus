import AnimeCard from '@/Components/AnimeCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AnimeSearchResponse } from '@/types/anime';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface SearchProps {
    results: AnimeSearchResponse | [];
    query: string;
    page: number;
    isGenre?: boolean;
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
                    <form onSubmit={handleSearch} className="mb-8">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search anime..."
                            className="w-full rounded-lg border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                        />
                    </form>
                )}

                <h1 className="mb-6 text-2xl font-bold text-white">
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
                                                ? route('anime.genre', {
                                                      genre: query,
                                                  })
                                                : route('anime.search'),
                                            {
                                                ...(isGenre
                                                    ? {}
                                                    : { q: query }),
                                                page: page - 1,
                                            },
                                        )
                                    }
                                    className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                                >
                                    Previous
                                </button>
                            )}
                            {hasNext && (
                                <button
                                    onClick={() =>
                                        router.get(
                                            isGenre
                                                ? route('anime.genre', {
                                                      genre: query,
                                                  })
                                                : route('anime.search'),
                                            {
                                                ...(isGenre
                                                    ? {}
                                                    : { q: query }),
                                                page: page + 1,
                                            },
                                        )
                                    }
                                    className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    query && (
                        <p className="text-gray-400">
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
        <div className="min-h-screen bg-gray-950">
            <SearchContent {...props} />
        </div>
    );
}
