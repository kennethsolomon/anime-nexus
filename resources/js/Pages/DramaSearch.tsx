import AnimeCard from '@/Components/AnimeCard';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ContentTypeSwitcher from '@/Components/ContentTypeSwitcher';
import LoadMoreButton from '@/Components/LoadMoreButton';
import SearchFilters from '@/Components/SearchFilters';
import SkeletonGrid from '@/Components/SkeletonGrid';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import usePageLoading from '@/hooks/usePageLoading';
import { DramaResult, DramaSearchResponse } from '@/types/anime';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface DramaSearchProps {
    results: DramaSearchResponse | [];
    query: string;
    page: number;
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

function DramaSearchContent({ results, query, page }: DramaSearchProps) {
    const [searchQuery, setSearchQuery] = useState(query);
    const [typeFilter, setTypeFilter] = useState('All');
    const [accumulated, setAccumulated] = useState<DramaResult[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const prevQueryRef = useRef(query);
    const loading = usePageLoading();

    const resultData = Array.isArray(results) ? null : results;
    const currentItems = resultData?.results || [];
    const hasNext = resultData?.hasNextPage || false;

    useEffect(() => {
        if (query !== prevQueryRef.current) {
            setAccumulated(currentItems);
            prevQueryRef.current = query;
        } else if (page === 1) {
            setAccumulated(currentItems);
        } else {
            setAccumulated((prev) => {
                const existingIds = new Set(prev.map((i) => i.id));
                const newItems = currentItems.filter((i) => !existingIds.has(i.id));
                return [...prev, ...newItems];
            });
        }
        setLoadingMore(false);
    }, [currentItems, query, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get(route('drama.search'), { q: searchQuery });
        }
    };

    const handleLoadMore = () => {
        setLoadingMore(true);
        router.get(
            route('drama.search'),
            { q: query, page: page + 1 },
            { preserveScroll: true, preserveState: true },
        );
    };

    const filteredItems = useMemo(() => {
        if (typeFilter === 'All') return accumulated;
        return accumulated.filter((item) =>
            item.type?.toUpperCase().includes(typeFilter.toUpperCase()),
        );
    }, [accumulated, typeFilter]);

    return (
        <>
            <Head title={`Drama Search: ${query}`} />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <form onSubmit={handleSearch} className="mb-8 sm:hidden">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search dramas..."
                        className="w-full rounded-full border-subtle bg-input px-4 py-3 text-primary placeholder-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                </form>

                <h1 className="mb-6 font-display text-2xl font-bold text-primary">
                    Results for "{query}"
                </h1>

                <SearchFilters
                    activeType={typeFilter}
                    onGenreSelect={() => {}}
                    onTypeSelect={setTypeFilter}
                    showGenres={false}
                />

                {loading && accumulated.length === 0 ? (
                    <SkeletonGrid count={12} />
                ) : filteredItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {filteredItems.map((drama) => (
                                <AnimeCard
                                    key={drama.id}
                                    id={drama.id}
                                    title={drama.title}
                                    image={drama.image}
                                    rating={drama.rating}
                                    type={drama.type}
                                    detailRoute={route('drama.show', { id: drama.id })}
                                />
                            ))}
                        </div>

                        <LoadMoreButton
                            loading={loadingMore}
                            onClick={handleLoadMore}
                            hasMore={hasNext}
                            shownCount={filteredItems.length}
                        />
                    </>
                ) : (
                    query && (
                        <p className="text-theme-secondary">No results found for "{query}"</p>
                    )
                )}
            </div>
        </>
    );
}

export default function DramaSearch(props: DramaSearchProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };

    if (auth?.user) {
        return (
            <AuthenticatedLayout>
                <DramaSearchContent {...props} />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-base">
            <GuestNav />
            <DramaSearchContent {...props} />
        </div>
    );
}
