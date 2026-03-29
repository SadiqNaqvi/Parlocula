import { HeadingSkeleton, MetaDataSkeleton, PosterSkeleton } from "./tools";

const ThreadBarSkeleton = () => (
    <div className="flex gap-2 items-center p-2">
        <PosterSkeleton className="size-10" />
        <div className="space-y-1">
            <HeadingSkeleton />
            <MetaDataSkeleton className="w-8" count={2} />
        </div>
    </div>
)

export const ThreadListSkeleton = ({ count = 12 }: { count?: number }) => (
    <ul>
        {Array(count).fill(0).map((_, i) => (
            <ThreadBarSkeleton key={i} />
        ))}
    </ul>
)

export default ThreadBarSkeleton;