import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge"

const InteractiveDetailSection = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <details className="relative [&[open]>summary]:absolute [&[open]>summary]:opacity-0 pointer">
        <summary className={twMerge("inset-0 line-clamp-3 marker:hidden", className)}>{children}</summary>
        <p className={className}>{children}</p>
    </details>
)

export default InteractiveDetailSection;