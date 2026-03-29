import { HeadingSkeleton, MetaDataSkeleton } from "./tools";


const SearchResultSkeleton = () => {
    return (
        <li className="w-full flex gap-2 md:gap-4 group p-2 items-center">
            <div className="w-12 md:w-16 aspect-square rounded-md group-even:rounded-full skeletonPulse"></div>
            <div className="flex-1 space-y-2">
                <HeadingSkeleton className="w-40" />
                <MetaDataSkeleton className="h-2" />
            </div>
        </li>
    )

}

export const SearchResultSkeletonList = ({ count = 8 }: { count?: number }) => (
    <ul>
        {Array(count).fill(0).map((_, i) => (
            <SearchResultSkeleton key={i} />
        ))}
    </ul>
)

export default SearchResultSkeleton;