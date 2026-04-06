import { HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton } from "./tools"

const UserBarSkeleton = () => (
    <li className="flex items-center gap-2 p-2 w-full max-w-3xl mx-auto">
        <PosterSkeleton />
        <div className="space-y-2">
            <HeadingSkeleton />
            <MetaDataSkeleton className="w-10" count={2} />
        </div>
    </li>
)


export const UserBarSkeletonList = ({ count = 12 }: { count?: number }) => (
    <ul className="w-full max-w-3xl mx-auto">
        {Array(count).fill(0).map((_, i) => (
            <UserBarSkeleton key={i} />
        ))}
    </ul>
)

export const FullPageUserBarSkeleton = ({ count = 12 }: { count?: number }) => (
    <PageWrapper>
        <UserBarSkeletonList count={count} />
    </PageWrapper>
)

export default UserBarSkeleton;