import { ShelfBarListSkeleton } from "./ShelfBarSkeleton"
import { ButtonSkeleton, HeadingSkeleton, MetaDataSkeleton, PageWrapper, PosterSkeleton } from "./tools"

const ShelfHeaderSkeleton = () => (
    <header className="pb-4 border-b border-gray30 px-2">
        <section className="flex gap-2 sm:gap-4 items-center">
            <PosterSkeleton className="size-20 sm:size-24" />

            <div className="space-y-2">
                <HeadingSkeleton className="sm:h-5 w-40" />
                <MetaDataSkeleton />
            </div>
        </section>
        <MetaDataSkeleton className="my-4" count={3} />

        <ButtonSkeleton className="mt-4" />
    </header>
)

const ShelfPageSkeleton = () => (
    <PageWrapper>
        <ShelfHeaderSkeleton />
        <ShelfBarListSkeleton />
    </PageWrapper>
)

export default ShelfPageSkeleton;