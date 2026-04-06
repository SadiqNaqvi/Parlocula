import { HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton } from "./tools"

const ShelfBarSkeleton = () => (
    <li className="flex items-center gap-3 p-2 rounded-md w-full max-w-3xl mx-auto">

        <PosterSkeleton className="size-12" />

        <div className="space-y-2">
            <HeadingSkeleton className="w-40" />
            <MetaDataSkeleton count={2} />
        </div>
    </li>
)


export const ShelfBarListSkeleton = ({ count = 12 }: { count?: number }) => (
    <ul className="w-full max-w-3xl mx-auto">
        {Array(count).fill(0).map((_, i) => (
            <ShelfBarSkeleton key={i} />
        ))}
    </ul>
);

export const FullPageShelfListSkeleton = ({ heading, count }: { heading?: string, count?: number }) => (
    <PageWrapper heading={heading}>
        <ShelfBarListSkeleton count={count} />
    </PageWrapper>
);

export default ShelfBarSkeleton;