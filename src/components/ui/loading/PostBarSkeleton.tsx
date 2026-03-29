import { FramesSkeleton, HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton, RandomHorizontalLinesSkeleton } from "./tools";

const PostBarSkeleton = () => (
    <div className="group px-2 py-4 space-y-4 w-full border-b group-last:border-0 border-gray10">

        <header className="space-y-2">
            <div className="flex gap-2 items-center">
                <PosterSkeleton className="size-10" />
                <HeadingSkeleton />
            </div>
            <MetaDataSkeleton count={4} />
        </header>

        <section className="space-y-2 mb-4">
            <RandomHorizontalLinesSkeleton count={3} className="h-4" />
            <FramesSkeleton
                containerClassName="group-odd:hidden"
                count={5}
                className="min-w-full xs:min-w-60 xs:w-60"
            />
        </section>

        <MetaDataSkeleton count={3} className="h-4 w-8" />

    </div>
)

export const PostListSkeleton = ({ count = 4 }: { count?: number }) => (
    <ul>
        {Array(count).fill(0).map((_, i) => (
            <PostBarSkeleton key={i} />
        ))}
    </ul>
)

export const FullPagePostListSkeleton = ({ count, heading }: { count?: number, heading?: string }) => (
    <PageWrapper heading={heading}>
        <PostListSkeleton count={count} />
    </PageWrapper>
)

export const OnlyFrameSkeletonList = ({ count = 12 }: { count?: number }) => (
    <ul className="grid grid-cols-3 gap-3">
        {Array(count).fill(0).map((_, i) => (
            <li key={i} className="w-full aspect-2/3 skeletonPulse"></li>
        ))}
    </ul>
)

export default PostBarSkeleton;