import { ImgHTMLAttributes } from 'react';

interface ApplicationLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
    showText?: boolean;
}

export default function ApplicationLogo({
    showText = true,
    className = '',
    ...props
}: ApplicationLogoProps) {
    return (
        <span className="inline-flex items-center gap-2">
            <img
                src="/images/anime-nexus-logo.png"
                alt="Anime Nexus"
                className={`h-8 w-8 rounded-full object-cover ${className}`}
                {...props}
            />
            {showText && (
                <span className="font-display text-lg font-bold tracking-wide">
                    <span className="text-accent">Anime</span>
                    <span className="text-secondary">Nexus</span>
                </span>
            )}
        </span>
    );
}
