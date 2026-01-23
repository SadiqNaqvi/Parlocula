

export const SearchResultSkeleton = () => {
    return (
        <>
            <li className="w-full flex gap-2 md:gap-4">
                <div className="w-16 md:w-20 aspect-[2/3] rounded-md skeletonLoading"></div>
                <div className="flex-1 space-y-4">
                    <div className="w-[80%] h-4 rounded-md skeletonLoading"></div>
                    <div className="w-[40%] h-4 rounded-md skeletonLoading"></div>
                </div>
            </li>
            <li className="w-full flex gap-2 md:gap-4">
                <div className="w-16 md:w-20 aspect-square rounded-full skeletonLoading"></div>
                <div className="flex-1 space-y-4">
                    <div className="w-[80%] h-4 rounded-md skeletonLoading"></div>
                    <div className="w-[40%] h-4 rounded-md skeletonLoading"></div>
                </div>
            </li>
        </>
    )

}

const SearchLoadingSection = () => {
    return (
        <ul className="space-y-4 w-full">
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
        </ul>
    )
}

export default SearchLoadingSection;