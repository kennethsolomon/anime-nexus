import { Link } from '@inertiajs/react';

interface AnimeCardProps {
    id: string;
    title: string;
    image: string;
    rating?: number;
    type?: string;
    episodeCount?: number;
    detailRoute?: string;
}

export default function AnimeCard({
    id,
    title,
    image,
    rating,
    type,
    episodeCount,
    detailRoute,
}: AnimeCardProps) {
    return (
        <Link
            href={detailRoute || route('anime.show', { id })}
            className="group block overflow-hidden rounded-xl border border-subtle bg-surface shadow-md transition duration-300 hover:-translate-y-1 hover:border-muted hover:shadow-lg hover:shadow-accent/5"
        >
            <div className="relative aspect-[3/4] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                {rating !== undefined && rating > 0 && (
                    <span className="absolute right-2 top-2 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs font-bold text-base">
                        {rating.toFixed(1)}
                    </span>
                )}
                {type && (
                    <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-base">
                        {type}
                    </span>
                )}
            </div>
            <div className="p-2.5">
                <h3 className="truncate text-sm font-medium text-primary">
                    {title}
                </h3>
                {episodeCount !== undefined && episodeCount > 0 && (
                    <p className="mt-0.5 font-mono text-xs text-theme-secondary">
                        {episodeCount} episodes
                    </p>
                )}
            </div>
        </Link>
    );
}
