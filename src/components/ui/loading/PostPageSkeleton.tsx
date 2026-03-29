import { CommentSectionSkeleton } from "./CommentSkeleton"
import { FramesSkeleton, HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton, RandomHorizontalLinesSkeleton, SmallButtonSkeleton, TabListSkeleton } from "./tools"

const PostHeaderSkeleton = () => (
    <header className="px-2">
        <div className="px-2 flex gap-2 items-center">
            <PosterSkeleton className="size-8" />
            <HeadingSkeleton className="w-40" />
        </div>

        <MetaDataSkeleton count={3} className="my-3" />

        <div className="space-y-2 my-4">
            <RandomHorizontalLinesSkeleton count={3} className="h-5" />
            <FramesSkeleton
                containerClassName="group-odd:hidden"
                count={5}
                className="min-w-full xs:min-w-60 xs:w-60"
            />
        </div>

        <MetaDataSkeleton count={3} className="h-5 w-20" />

    </header>
)

const PostPageSkeleton = ({ heading }: { heading?: string }) => (
    <PageWrapper heading={heading}>
        <PostHeaderSkeleton />
        <TabListSkeleton count={4} className="my-4" />
        <CommentSectionSkeleton />
    </PageWrapper>
)

export default PostPageSkeleton;