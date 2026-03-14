import { useState } from 'react';

interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md';
}

export default function StarRating({
    value,
    onChange,
    readonly = false,
    size = 'md',
}: StarRatingProps) {
    const [hovered, setHovered] = useState(0);

    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
    const touchSize = size === 'sm' ? '' : 'min-h-[44px] min-w-[44px]';

    return (
        <div className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = hovered > 0 ? star <= hovered : star <= value;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => onChange?.(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(0)}
                        className={`inline-flex items-center justify-center transition ${touchSize} ${
                            readonly ? 'cursor-default' : 'cursor-pointer'
                        }`}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                        <svg
                            className={`${starSize} ${
                                filled ? 'text-secondary' : 'text-muted'
                            } transition-colors`}
                            fill={filled ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
