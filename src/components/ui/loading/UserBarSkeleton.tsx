import { HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton } from "./tools"

const UserBarSkeleton = () => (
    <li className="flex items-center gap-2 p-2">
        <PosterSkeleton />
        <div className="space-y-2">
            <HeadingSkeleton />
            <MetaDataSkeleton className="w-10" count={2} />
        </div>
    </li>
)


export const UserBarSkeletonList = ({ count = 12 }: { count?: number }) => (
    <ul>
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