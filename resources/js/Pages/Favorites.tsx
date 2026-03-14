import AnimeCard from '@/Components/AnimeCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ContentType } from '@/types/anime';
import { Head, Link, router } from '@inertiajs/react';

interface FavoriteItem {
    id: number;
    anime_id: string;
    anime_title: string;
    anime_image: string | null;
    content_type: ContentType;
    created_at: string;
}

interface FavoritesProps {
    favorites: FavoriteItem[];
    currentContentType: ContentType;
}

export default function Favorites({ favorites, currentContentType }: FavoritesProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Favorites" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="mb-6 font-display text-2xl font-bold text-primary">
                    My Favorites
                </h1>

                {/* Content type tabs */}
                <div className="mb-6 flex gap-2">
                    {(['anime', 'drama'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => router.get(route('favorites.index'), { content_type: type })}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                currentContentType === type
                                    ? 'bg-accent text-base'
                                    : 'border border-muted bg-input text-theme-secondary hover:border-accent hover:text-primary'
                            }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {favorites.map((item) => (
                            <AnimeCard
                                key={item.id}
                                id={item.anime_id}
                                title={item.anime_title}
                                image={item.anime_image || ''}
                                detailRoute={route(
                                    currentContentType === 'drama' ? 'drama.show' : 'anime.show',
                                    { id: item.anime_id },
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-subtle bg-surface p-8 text-center">
                        <p className="text-theme-secondary">No favorites yet.</p>
                        <Link
                            href={route('home')}
                            className="mt-3 inline-block text-sm text-accent hover:text-accent-hover"
                        >
                            Browse anime to add some
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
