import { PostListSkeleton } from "./PostBarSkeleton";
import { ButtonSkeleton, HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton, RandomHorizontalLinesSkeleton, TabListSkeleton } from "./tools";

export const UserPageHeaderSkeleton = () => (
    <header className="mt-4 px-2 sm:px-4">
        <section className="flex gap-4 items-center">
            <PosterSkeleton className="size-20 sm:size-28" />
            <div className="space-y-1">
                <HeadingSkeleton className="w-40 sm:h-6" />
                <RandomHorizontalLinesSkeleton width="80px" />
            </div>
        </section>
        <section className="mt-4 space-y-2">
            <MetaDataSkeleton count={3} />
            <RandomHorizontalLinesSkeleton count={3} />
        </section>
        <section className="mt-4 flex gap-2">
            <ButtonSkeleton />
            <ButtonSkeleton />
        </section>
    </header>
);

const UserPageSkeleton = ({ heading }: { heading?: string }) => (
    <PageWrapper heading={heading}>
        <UserPageHeaderSkeleton />
        <TabListSkeleton containerClassName="my-4" count={3} />
        <PostListSkeleton count={2} />
    </PageWrapper>
)

export default UserPageSkeleton;