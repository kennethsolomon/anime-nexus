import { useToast } from '@/Components/ToastContext';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface FavoriteButtonProps {
    animeId: string;
    animeTitle: string;
    animeImage: string;
    contentType: 'anime' | 'drama';
    isFavorited: boolean;
}

export default function FavoriteButton({
    animeId,
    animeTitle,
    animeImage,
    contentType,
    isFavorited: initialFavorited,
}: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const toast = useToast();

    const handleToggle = () => {
        // Optimistic update
        setFavorited(!favorited);

        router.post(
            route('favorites.toggle'),
            {
                anime_id: animeId,
                anime_title: animeTitle,
                anime_image: animeImage,
                content_type: contentType,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
                },
                onError: () => {
                    setFavorited(favorited); // Revert
                    toast.error('Failed to update favorites');
                },
            },
        );
    };

    return (
        <button
            onClick={handleToggle}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border px-3 py-2 transition ${
                favorited
                    ? 'border-danger/50 bg-danger/10 text-danger hover:bg-danger/20'
                    : 'border-muted bg-input text-theme-secondary hover:border-danger hover:text-danger'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <svg
                className="h-5 w-5"
                fill={favorited ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
