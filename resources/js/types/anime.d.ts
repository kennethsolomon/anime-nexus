export interface AnimeResult {
    id: string;
    title: string;
    image: string;
    rating?: number;
    type?: string;
    totalEpisodes?: number;
    url?: string;
}

export interface AnimeSearchResponse {
    currentPage?: number;
    hasNextPage?: boolean;
    results: AnimeResult[];
    error?: boolean;
    message?: string;
}

export interface Episode {
    id: string;
    number: number;
    title?: string;
    url?: string;
}

export interface AnimeInfo {
    id: string;
    title: string;
    image: string;
    cover?: string;
    description?: string;
    genres?: string[];
    status?: string;
    rating?: number;
    type?: string;
    releaseDate?: string;
    totalEpisodes?: number;
    episodes?: Episode[];
    error?: boolean;
    message?: string;
}

export interface StreamingSource {
    url: string;
    quality: string;
    isM3U8: boolean;
}

export interface StreamingResponse {
    headers?: Record<string, string>;
    sources: StreamingSource[];
    subtitles?: { url: string; lang: string }[];
    intro?: { start: number; end: number };
    outro?: { start: number; end: number };
    download?: string;
    error?: boolean;
    message?: string;
}

export interface WatchlistItem {
    id: number;
    anime_id: string;
    anime_title: string;
    anime_image: string | null;
    status: 'watching' | 'plan_to_watch' | 'completed' | 'dropped';
    created_at: string;
    updated_at: string;
}

export interface WatchHistoryItem {
    id: number;
    anime_id: string;
    episode_id: string;
    episode_number: number;
    progress_seconds: number;
    completed: boolean;
    watched_at: string;
}
