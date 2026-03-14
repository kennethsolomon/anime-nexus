import AnimeCard from '@/Components/AnimeCard';
import { AnimeResult } from '@/types/anime';

interface RecommendationSectionProps {
    title?: string;
    items: AnimeResult[];
    contentType?: 'anime' | 'drama';
}

export default function RecommendationSection({
    title = 'You Might Also Like',
    items,
    contentType = 'anime',
}: RecommendationSectionProps) {
    if (items.length === 0) return null;

    return (
        <div className="mt-8">
            <h2 className="mb-4 font-display text-lg font-bold text-primary">
                {title}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {items.slice(0, 10).map((item) => (
                    <div key={item.id} className="w-36 shrink-0 sm:w-40">
                        <AnimeCard
                            id={item.id}
                            title={item.title}
                            image={item.image}
                            rating={item.rating}
                            type={item.type}
                            detailRoute={
                                contentType === 'drama'
                                    ? route('drama.show', { id: item.id })
                                    : undefined
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
