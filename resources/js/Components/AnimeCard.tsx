import { Link } from '@inertiajs/react';

interface AnimeCardProps {
    id: string;
    title: string;
    image: string;
    rating?: number;
    type?: string;
    episodeCount?: number;
}

export default function AnimeCard({
    id,
    title,
    image,
    rating,
    type,
    episodeCount,
}: AnimeCardProps) {
    return (
        <Link
            href={route('anime.show', { id })}
            className="group block overflow-hidden rounded-lg bg-gray-900 shadow-md transition hover:shadow-xl"
        >
            <div className="relative aspect-[3/4] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                {rating !== undefined && rating > 0 && (
                    <span className="absolute top-2 right-2 rounded bg-yellow-500 px-1.5 py-0.5 text-xs font-bold text-black">
                        {rating.toFixed(1)}
                    </span>
                )}
                {type && (
                    <span className="absolute top-2 left-2 rounded bg-purple-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                        {type}
                    </span>
                )}
            </div>
            <div className="p-2">
                <h3 className="truncate text-sm font-medium text-white">
                    {title}
                </h3>
                {episodeCount !== undefined && episodeCount > 0 && (
                    <p className="mt-0.5 text-xs text-gray-400">
                        {episodeCount} episodes
                    </p>
                )}
            </div>
        </Link>
    );
}
