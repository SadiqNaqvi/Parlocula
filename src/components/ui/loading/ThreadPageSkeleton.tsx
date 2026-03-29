import { PostListSkeleton } from "./";
import { ButtonSkeleton, HeadingSkeleton, PageWrapper, PosterSkeleton, RandomHorizontalLinesSkeleton, TabListSkeleton } from "./tools";

export const ThreadHeaderSkeleton = () => (
    <div className="px-2 sm:px-4 mt-2">

        <section className="flex gap-2 sm:gap-4 items-center">
            <PosterSkeleton className="size-24 sm:size-32" />

            <div className="space-y-2 flex-1">
                <HeadingSkeleton className="h-4 sm:h-5 w-[60%]" />
                <RandomHorizontalLinesSkeleton width="30%" />
            </div>
        </section>

        <RandomHorizontalLinesSkeleton count={2} containerClassName="mt-4" />

        <section className="mt-4 flex gap-2">
            <ButtonSkeleton />
            <ButtonSkeleton />
        </section>

    </div>
)

const ThreadPageSkeleton = ({ heading }: { heading?: string }) => (
    <PageWrapper heading={heading}>
        <ThreadHeaderSkeleton />
        <TabListSkeleton className="my-4" count={3} />
        <PostListSkeleton count={2} />
    </PageWrapper>
)

export default ThreadPageSkeleton;