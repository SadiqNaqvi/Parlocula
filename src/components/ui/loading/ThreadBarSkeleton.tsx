import { HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton } from "./tools";

const ThreadBarSkeleton = () => (
    <div className="flex gap-2 items-center p-2 max-w-3xl mx-auto w-full">
        <PosterSkeleton className="size-10" />
        <div className="space-y-1">
            <HeadingSkeleton />
            <MetaDataSkeleton className="w-8" count={2} />
        </div>
    </div>
)

export const ThreadListSkeleton = ({ count = 12 }: { count?: number }) => (
    <ul className="w-full max-w-3xl mx-auto">
        {Array(count).fill(0).map((_, i) => (
            <ThreadBarSkeleton key={i} />
        ))}
    </ul>
)

export const FullPageShelfListSkeleton = ({ heading, count }: { heading?: string, count?: number }) => (
    <PageWrapper heading={heading}>
        <ThreadListSkeleton count={count} />
    </PageWrapper>
);

export default ThreadBarSkeleton;