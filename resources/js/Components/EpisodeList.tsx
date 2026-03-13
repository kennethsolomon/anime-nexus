import { Link } from '@inertiajs/react';

interface Episode {
    id: string;
    number: number;
    title?: string;
}

interface EpisodeListProps {
    animeId: string;
    episodes: Episode[];
    currentEpisodeId?: string;
    watchedEpisodes?: string[];
    buildEpisodeUrl?: (episodeId: string) => string;
}

export default function EpisodeList({
    animeId,
    episodes,
    currentEpisodeId,
    watchedEpisodes = [],
    buildEpisodeUrl,
}: EpisodeListProps) {
    return (
        <div className="max-h-96 overflow-y-auto rounded-xl border border-subtle bg-surface">
            <div className="sticky top-0 border-b border-subtle bg-surface px-4 py-2.5">
                <h3 className="font-display text-sm font-semibold text-primary">
                    Episodes ({episodes.length})
                </h3>
            </div>
            <div className="divide-y divide-subtle">
                {episodes.map((episode) => {
                    const isActive = episode.id === currentEpisodeId;
                    const isWatched = watchedEpisodes.includes(episode.id);

                    return (
                        <Link
                            key={episode.id}
                            href={buildEpisodeUrl ? buildEpisodeUrl(episode.id) : route('anime.watch', {
                                id: animeId,
                                episodeId: episode.id,
                            })}
                            className={`flex items-center gap-3 px-4 py-3 transition hover:bg-input ${
                                isActive
                                    ? 'border-l-2 border-accent bg-accent/10'
                                    : ''
                            }`}
                        >
                            <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${
                                    isActive
                                        ? 'bg-accent text-base'
                                        : isWatched
                                          ? 'bg-success/20 text-success'
                                          : 'bg-input text-theme-secondary'
                                }`}
                            >
                                {episode.number}
                            </span>
                            <span
                                className={`truncate text-sm ${
                                    isActive
                                        ? 'font-semibold text-primary'
                                        : 'text-theme-secondary'
                                }`}
                            >
                                {episode.title || `Episode ${episode.number}`}
                            </span>
                            {isWatched && !isActive && (
                                <span className="ml-auto text-xs text-success">
                                    Watched
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
