import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-accent bg-accent/10 text-primary focus:border-accent focus:bg-accent/15'
                    : 'border-transparent text-theme-secondary hover:border-muted hover:bg-input hover:text-primary focus:border-muted focus:bg-input focus:text-primary'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
