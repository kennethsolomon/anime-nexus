export default function SkeletonDetail() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row">
                {/* Poster placeholder — matches md:w-64 */}
                <div className="w-full shrink-0 md:w-64">
                    <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-input" />
                </div>

                {/* Info placeholder */}
                <div className="flex-1">
                    {/* Title */}
                    <div className="h-8 w-2/3 animate-pulse rounded bg-input" />

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <div className="h-7 w-12 animate-pulse rounded-md bg-input" />
                        <div className="h-7 w-16 animate-pulse rounded-md bg-input" />
                        <div className="h-7 w-20 animate-pulse rounded-md bg-input" />
                        <div className="h-7 w-14 animate-pulse rounded-md bg-input" />
                    </div>

                    {/* Genre pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-input" />
                        ))}
                    </div>

                    {/* Description lines */}
                    <div className="mt-4 space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-input" />
                        <div className="h-4 w-full animate-pulse rounded bg-input" />
                        <div className="h-4 w-3/4 animate-pulse rounded bg-input" />
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex gap-3">
                        <div className="h-11 w-36 animate-pulse rounded-lg bg-input" />
                        <div className="h-11 w-40 animate-pulse rounded-lg bg-input" />
                    </div>
                </div>
            </div>

            {/* Episode list placeholder */}
            <div className="mt-8">
                <div className="mb-3 h-6 w-24 animate-pulse rounded bg-input" />
                <div className="space-y-2">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-input" />
                    ))}
                </div>
            </div>
        </div>
    );
}
