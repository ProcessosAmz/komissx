import type { ReactNode } from "react";

export function PageHeader({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                    {title}
                </h1>
                {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
