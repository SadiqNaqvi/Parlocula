import { CommentSectionSkeleton } from "./CommentSkeleton";
import { ButtonSkeleton, HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton, RandomHorizontalLinesSkeleton, TabListSkeleton } from "./tools";

const CommentHeaderSkeleton = () => (
    <header className="flex items-center gap-3 px-2">

        <div className="flex items-center gap-2">
            <PosterSkeleton />
            <HeadingSkeleton />
        </div>

        <MetaDataSkeleton className="my-3" count={3} />

        <section className="my-3 space-y-2">
            <RandomHorizontalLinesSkeleton count={3} />

            <div className="size-64 rounded-md skeletonPulse"></div>
        </section>

        <div className="flex gap-2 my-4 items-center">
            <ButtonSkeleton />
            <ButtonSkeleton />
        </div>
    </header>
)

const CommentPageSkeleton = () => (
    <PageWrapper>
        <CommentHeaderSkeleton />
        <TabListSkeleton className="my-4" />
        <CommentSectionSkeleton />
    </PageWrapper>
)

export default CommentPageSkeleton;