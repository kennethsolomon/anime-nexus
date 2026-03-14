import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface HeroSlide {
    id: string;
    title: string;
    image: string;
    rating?: number;
    type?: string;
    genres?: string[];
    description?: string;
    watchUrl: string;
    detailUrl: string;
}

interface HeroBannerProps {
    slides: HeroSlide[];
}

export default function HeroBanner({ slides }: HeroBannerProps) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number | null>(null);

    const count = slides.length;

    const goTo = useCallback(
        (index: number) => {
            setCurrent(((index % count) + count) % count);
        },
        [count],
    );

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    // Auto-rotate every 6s
    useEffect(() => {
        if (paused || count <= 1) return;
        timerRef.current = setInterval(next, 6000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [paused, next, count]);

    // Swipe handling
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) {
            diff < 0 ? next() : prev();
        }
        touchStartX.current = null;
    };

    if (count === 0) return null;

    const slide = slides[current];

    return (
        <div
            className="relative mb-8 overflow-hidden rounded-2xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background: blurred poster */}
            <div className="relative h-[40vh] w-full sm:h-[50vh] lg:h-[60vh]">
                <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl brightness-[0.3]"
                    aria-hidden="true"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-base/90 via-base/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent" />

                {/* Content */}
                <div className="relative flex h-full items-end px-6 pb-8 sm:items-center sm:pb-0 lg:px-12">
                    <div className="flex w-full items-end gap-6 sm:items-center">
                        {/* Poster (hidden on small mobile) */}
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="hidden h-48 w-32 shrink-0 rounded-xl object-cover shadow-2xl sm:block lg:h-64 lg:w-44"
                        />

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <h2 className="line-clamp-2 font-display text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
                                {slide.title}
                            </h2>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {slide.rating !== undefined && slide.rating > 0 && (
                                    <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs font-bold text-base">
                                        {slide.rating.toFixed(1)}
                                    </span>
                                )}
                                {slide.type && (
                                    <span className="rounded bg-accent px-2 py-0.5 text-xs font-semibold text-base">
                                        {slide.type}
                                    </span>
                                )}
                                {slide.genres?.slice(0, 3).map((genre) => (
                                    <span
                                        key={genre}
                                        className="rounded-full border border-muted/50 px-2.5 py-0.5 text-xs text-theme-secondary"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>

                            {slide.description && (
                                <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-theme-secondary">
                                    {slide.description}
                                </p>
                            )}

                            <div className="mt-4 flex gap-3">
                                <Link
                                    href={slide.detailUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-base transition hover:bg-secondary-hover"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Watch Now
                                </Link>
                                <Link
                                    href={slide.detailUrl}
                                    className="inline-flex items-center gap-2 rounded-lg border border-muted bg-input/50 px-5 py-2.5 text-sm font-medium text-primary transition hover:border-accent hover:text-accent"
                                >
                                    Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation arrows — desktop only */}
            {count > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-base/60 p-2 text-primary backdrop-blur-sm transition hover:bg-base/80 sm:block"
                        aria-label="Previous slide"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-base/60 p-2 text-primary backdrop-blur-sm transition hover:bg-base/80 sm:block"
                        aria-label="Next slide"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dot indicators */}
            {count > 1 && (
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`h-1.5 rounded-full transition-all ${
                                i === current
                                    ? 'w-6 bg-accent'
                                    : 'w-1.5 bg-primary/30 hover:bg-primary/50'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
