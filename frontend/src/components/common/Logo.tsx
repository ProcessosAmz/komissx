import React from 'react';

interface LogoProps {
    variant?: 'default' | 'compact';
    size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'default', size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-4xl font-extrabold'
    };

    return (
        <div className="flex items-center gap-2 select-none">
            {/* Ícone Geométrico do KomissX */}
            <svg
                className={`text-indigo-500 ${size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>

            {/* Texto da Marca */}
            {variant === 'default' && (
                <span className={`font-bold tracking-tight text-white ${sizeClasses[size]}`}>
                    Komiss<span className="text-indigo-500">X</span>
                </span>
            )}
        </div>
    );
};