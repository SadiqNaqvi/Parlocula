import { HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton, RandomHorizontalLinesSkeleton } from "./tools";

const CommentBarSkeleton = () => {
    return (
        <li className="w-full p-2 group last:border-0 border-b border-gray30">

            <header>
                <div className="flex gap-2 items-center mb-2">
                    <PosterSkeleton className="size-10" />

                    <HeadingSkeleton />
                </div>
                <MetaDataSkeleton count={3} />
            </header>
            <section className="my-4 space-y-2">
                <div className="size-24 rounded-md skeletonPulse group-odd:hidden"></div>
                <RandomHorizontalLinesSkeleton count={3} />
            </section>

            <MetaDataSkeleton count={3} className="h-4 w-8" />
        </li>
    )
}

export const CommentSectionSkeleton = ({ count = 6 }: { count?: number }) => (
    <ul>
        {
            Array(count).fill(0).map((_, i) => <CommentBarSkeleton key={i} />)
        }
    </ul>
)

export const FullPageCommentBarSkeleton = ({ count, heading }: { count?: number, heading?: string }) => (
    <PageWrapper heading={heading}>
        <CommentSectionSkeleton count={count} />
    </PageWrapper>
)

export default CommentBarSkeleton;