export default function SkeletonPlayer() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Player placeholder */}
                <div className="lg:col-span-2">
                    <div className="aspect-video w-full animate-pulse rounded-lg bg-input" />

                    {/* Episode nav */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="h-10 w-20 animate-pulse rounded-lg bg-input" />
                        <div className="h-6 w-40 animate-pulse rounded bg-input" />
                        <div className="h-10 w-20 animate-pulse rounded-lg bg-input" />
                    </div>

                    {/* Title link */}
                    <div className="mt-3 h-4 w-48 animate-pulse rounded bg-input" />
                </div>

                {/* Episode list sidebar */}
                <div>
                    <div className="mb-3 h-6 w-24 animate-pulse rounded bg-input" />
                    <div className="space-y-2">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-input" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
