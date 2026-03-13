import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-muted bg-input text-accent shadow-sm focus:ring-accent focus:ring-offset-base ' +
                className
            }
        />
    );
}
