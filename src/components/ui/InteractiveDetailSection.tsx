import { PropsWithChildren } from "react";

const InteractiveDetailSection = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <details className="relative [&[open]>summary]:absolute [&[open]>summary]:opacity-0 pointer">
        <summary className={`inset-0 line-clamp-2 ${className ?? ''}`}>{children}</summary>
        <p className={className}>{children}</p>
    </details>
)

export default InteractiveDetailSection;