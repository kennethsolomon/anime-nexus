import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-base pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex flex-col items-center gap-3">
                    <img
                        src="/images/anime-nexus-logo.png"
                        alt="Anime Nexus"
                        className="h-24 w-24 rounded-full object-cover"
                    />
                    <span className="font-display text-2xl font-bold tracking-wide">
                        <span className="text-accent">Anime</span>
                        <span className="text-secondary">Nexus</span>
                    </span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-xl border border-subtle bg-surface px-6 py-6 shadow-xl sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
