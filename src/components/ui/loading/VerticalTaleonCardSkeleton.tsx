import { twMerge } from "tailwind-merge";
import { RandomHorizontalLinesSkeleton } from "./tools";

const VerticalTaleonCardSkeleton = ({ className }: { className?: string }) => (
    <div className={twMerge("min-w-44 w-44 aspect-2/3 space-y-2", className)}>
        <div className="w-full aspect-2/3 skeletonPulse"></div>
        <RandomHorizontalLinesSkeleton count={2} />
    </div>
)

export const VerticalTaleonCardSkeletonList = ({ count = 6, className }: { count?: number, className?: string }) => (
    <ul className={twMerge("flex overflow-hidden gap-2 w-full max-w-3xl mx-auto", className)}>
        {Array(count).fill(0).map((_, i) => (
            <VerticalTaleonCardSkeleton key={i} />
        ))}
    </ul>
)

export default VerticalTaleonCardSkeleton;